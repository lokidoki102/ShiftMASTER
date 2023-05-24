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
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"; 

const userAuthContext = createContext();
const userCollection = collection(db, "users");

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState({});

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  async function signUp(email, password) {
    const data = {
      UserEmail: email,
      UserPassword: password
    }
    await addDoc(userCollection, data);
    return createUserWithEmailAndPassword(auth, email, password);
  }
  function logOut() {
    signOut(auth).then((result) => {
        console.log(result);
        console.log("Entered Sign Out");
    }).catch((e) => { console.log(e) })
  }
  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider).then((result) => {
        const user = result.user;
        const data = {
            UserEmail: user.email,
            UserPassword: "Password in Google"
          }
          addDoc(userCollection, data);
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