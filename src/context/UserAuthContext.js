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
    async function authenticateUserToCompany(uniqueCode, companyName){
        // Get the Company Name from the Unique Code (in case some companies name are identical)
        if(uniqueCode === ""){
            return Promise.resolve(companyName);
        }
        let finalCompanyName = "";
        await getDocs(companyCodeCollection).then((snapshot) => {
            let companies = [];
            snapshot.docs.forEach((doc) => {
                companies.push({ ...doc.data() })
            })
            for (var i = 0; i < companies.length; i++){
                if(companies[i].CompanyCode === uniqueCode){
                    finalCompanyName = companies[i].Company;
                }
            }
        })
        return Promise.resolve(finalCompanyName);
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
        return data;
    }
    function signUp(email, password, name, phoneNumber, companyName, uniqueCode) {
        // Sign Up using normal email (seperate manager and employee role)
        console.log("Entered Sign Up");
        return createUserWithEmailAndPassword(auth, email, password).then((result) => {
            const user = result.user;
            const userID = user.uid;
            const companyCode = companyCodeGenerator(companyName);
            authenticateUserToCompany(uniqueCode, companyName).then((companyConfirmName) => {
                addDoc(userCollection, assignRoles(userID, email, name, phoneNumber, companyConfirmName, uniqueCode, companyCode))
            })
        });
    }
    function logIn(email, password) {
        // Log In using normal email and password
        console.log("Entered Log In");
        return signInWithEmailAndPassword(auth, email, password);
    }
    function logOut() {
        signOut(auth).then((result) => {
            console.log(result);
            console.log("Entered Log Out");
        }).catch((e) => { console.log(e) })
    }
    async function googleSignIn() {
        // Log in using Google email (have yet to edit to complement the two different roles)
        const googleAuthProvider = new GoogleAuthProvider();
        let exist;
        return signInWithPopup(auth, googleAuthProvider).then(async (result) => {
            const user = result.user;
            // This method is to check whether the Google Email exist within ShiftMaster FireBase
            await getDocs(userCollection).then(async (snapshot) => {
                let allUsers = [];
                snapshot.docs.forEach((doc) => {
                    allUsers.push({ ...doc.data() })
                })
                for (var i = 0; i < allUsers.length; i++) {
                    if (allUsers[i].UserID === user.uid) {
                        // It will return if the User ID exist in the userCollection
                        exist = true;
                    }
                }
                // This will be performed if the User ID does not exist in the userCollection
                exist = false;
            })
            return Promise.resolve(exist);
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