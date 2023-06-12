import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase";
import React from 'react';
import { collection, getDocs, addDoc } from "firebase/firestore";

const userAuthContext = createContext();
const userCollection = collection(db, "users");
const companyCodeCollection = collection(db, "companies");

export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState({});

    function companyCodeGenerator(companyName){
        // Generate unique company codes upon signing up by the Manager and store company codes into companyCodeCollection
        if(companyName === ""){
            return;
        }
        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for ( let i = 0; i < 4; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        let companyCode = companyName.concat("-", result);
        let companyData = {
            Company: companyName,
            CompanyCode: companyCode
        }
        addDoc(companyCodeCollection, companyData);
        return companyCode;
    }
    function authenticateUserToCompany(uniqueCode){
        // Get the Company Name from the Unique Code (in case some companies name are identical)
        if(uniqueCode === ""){
            return;
        }
        let finalName = "";
        getDocs(companyCodeCollection).then((snapshot) => {
            let companies = [];
            snapshot.docs.forEach((doc) => {
                companies.push({ ...doc.data() })
            })
            for (var i = 0; i < companies.length; i++){
                if(companies[i].CompanyCode === uniqueCode){
                    finalName = companies[i].Company;
                }
            }
        })
        return finalName;
    }
    function assignRoles(userID, email, name, phoneNumber, companyName, uniqueCode, companyCode){
        // Assign roles based on the role: Employee/Manager
        let data = {};
        if (uniqueCode === ""){
            data = {
                UserID: userID,
                UserEmail: email,
                UserName: name,
                UserPhoneNumber: phoneNumber,
                CompanyName: companyName,
                CompanyCode: companyCode,
                Role: "Manager"
            }
        } else {
            data = {
                UserID: userID,
                UserEmail: email,
                UserName: name,
                UserPhoneNumber: phoneNumber,
                CompanyName: companyName,
                Status: "Not Approved",
                Role: "Employee"
            }
        }
        addDoc(userCollection, data);
    }
    function signUp(email, password, name, phoneNumber, companyName, uniqueCode) {
        return createUserWithEmailAndPassword(auth, email, password).then((result) => {
            const user = result.user;
            const userID = user.uid;
            const companyCode = companyCodeGenerator(companyName);
            companyName = authenticateUserToCompany(uniqueCode);
            assignRoles(userID, email, name, phoneNumber, companyName, uniqueCode, companyCode);
        });
    }
    function logIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }
    function logOut() {
        signOut(auth).then((result) => {
            console.log(result);
            console.log("Entered Sign Out");
        }).catch((e) => { console.log(e) })
    }
    function googleSignIn() {
        const googleAuthProvider = new GoogleAuthProvider();
        return signInWithPopup(auth, googleAuthProvider).then(async (result) => {
            const user = result.user;
            // This method is to check whether the Google Email exist within ShiftMaster FireBase
            getDocs(userCollection).then((snapshot) => {
                let allUsers = [];
                snapshot.docs.forEach((doc) => {
                    allUsers.push({ ...doc.data() })
                })
                for (var i = 0; i < allUsers.length; i++) {
                    if (allUsers[i].UserID === user.uid) {
                        return;
                    }
                }
                const data = {
                    UserID: user.uid,
                    UserEmail: user.email,
                }
                addDoc(userCollection, data);
            })
        });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
            console.log("Auth", currentuser);
            setUser(currentuser);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <userAuthContext.Provider value={{ user, logIn, signUp, logOut, googleSignIn }}>
            {children}
        </userAuthContext.Provider>
    );
}

export function useUserAuth() {
    return useContext(userAuthContext);
}