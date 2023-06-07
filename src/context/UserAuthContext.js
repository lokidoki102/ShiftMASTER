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

export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState({});

    function logIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }
    function signUp(email, password, name, phoneNumber) {
        return createUserWithEmailAndPassword(auth, email, password).then((result) => {
            const user = result.user;
            const data = {
                UserID: user.uid,
                UserEmail: email,
                UserPassword: password,
                UserName: name,
                UserPhoneNumber: phoneNumber
            }
            addDoc(userCollection, data);
        });
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
                    console.log(allUsers[i].UserID);
                    console.log(user.uid)
                    if (allUsers[i].UserID === user.uid) {
                        return;
                    }
                }
                const data = {
                    UserID: user.uid,
                    UserEmail: user.email,
                    UserPassword: ""
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