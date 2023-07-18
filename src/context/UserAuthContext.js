import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth, db } from "../firebase";
import React from 'react';
import { collection, getDocs, addDoc, where, query, doc, updateDoc, deleteDoc, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";

const userAuthContext = createContext();
const userCollection = collection(db, "users");
const companyCodeCollection = collection(db, "companies");

export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true); // Loading State

    function companyCodeGenerator(companyName) {
        // Generate unique company codes upon signing up by the Manager and store company codes into companyCodeCollection
        if (companyName === "") {
            return;
        }
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < 4; i++) {
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
    async function getCodeCollection(codeCollection) {
        // Get all of the company code from Firebase and store into an array
        let newArray = [];
        await getDocs(codeCollection).then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                newArray.push({ ...doc.data() })
            })
        })
        return newArray;
    }
    async function getUserProfile(userId) {
        // Get Individual User Profile
        let data;
        const docRef = query(userCollection, where("UserID", "==", userId));
        try {
            const docSnap = await getDocs(docRef);
            docSnap.forEach((doc) => {
                data = doc.data();
            });
            return Promise.resolve(data);
        } catch (error) {
            console.log(error);
        }
    }
    async function updateUserProfile(userId, name, phoneNumber) {
        // Update User Profile
        let data;
        const docRef = query(userCollection, where("UserID", "==", userId));
        try {
            const docSnap = await getDocs(docRef);
            docSnap.forEach(async (oneDoc) => {
                const newRef = doc(db, "users", oneDoc.id);
                await updateDoc(newRef, {
                    UserName: name,
                    UserPhoneNumber: phoneNumber
                }).then(() => {
                    const notificationRef = collection(newRef, "notifications");
                    addDoc(notificationRef, {
                        Timestamp: serverTimestamp(),
                        Notification: "You have updated your user profile.",
                        UserID: userId,
                        isViewed: false
                    })
                });
            })
            return Promise.resolve(data);
        } catch (error) {
            console.log(error);
        }
    }
    async function getAllEmployees(companyCode) {
        // Get All Employees and Display in Manager Profile
        let data;
        let newArray = [];
        const docRef = query(userCollection, where("CompanyCode", "==", companyCode), where("Role", "==", "Employee"));
        try {
            const docSnap = await getDocs(docRef);
            docSnap.forEach((doc) => {
                data = doc.data();
                newArray.push(data);
            });
            return Promise.resolve(newArray);
        } catch (error) {
            console.log(error);
        }
    }
    async function approveEmployees(allEmployees, oneUser) {
        // Approve Employees that is selected in the checkbox.
        try {
            let arrayOfName = new Array();
            for (var i = 0; i < allEmployees.length; i++) {
                if (allEmployees[i].Status === "Pending Approval") {
                    const userId = allEmployees[i].UserID;
                    arrayOfName.push(allEmployees[i].UserName);
                    const docRefs = query(userCollection, where("CompanyCode", "==", allEmployees[i].CompanyCode), where("UserID", "==", allEmployees[i].UserID));
                    const docSnap = await getDocs(docRefs);
                    docSnap.forEach(async (oneDoc) => {
                        const userRef = doc(db, "users", oneDoc.id);
                        await updateDoc(userRef, {
                            Status: "Approved"
                        }).then(() => {
                            // Sending notifications to employee that they have been approved.
                            const notificationRef = collection(userRef, "notifications");
                            addDoc(notificationRef, {
                                Timestamp: serverTimestamp(),
                                Notification: "You have been approved! You can start to suggest your preferred working timing.",
                                UserID: userId,
                                isViewed: false
                            })
                        });
                    })
                }
            }
            // Sending notification to manager which employees they have approved
            await sendNotificationToManager(arrayOfName, oneUser.UserID, "Approved");
        } catch (error) {
            console.log(error);
        }
    }
    async function deleteEmployees(allEmployees, oneUser) {
        // Delete Employees that is selected in the checkbox
        try {
            let arrayOfName = new Array();
            for (var i = 0; i < allEmployees.length; i++) {
                if (allEmployees[i].Status === "Pending Deletion") {
                    arrayOfName.push(allEmployees[i].UserName);
                    const docRef = query(userCollection, where("CompanyCode", "==", allEmployees[i].CompanyCode), where("UserID", "==", allEmployees[i].UserID));
                    const docSnap = await getDocs(docRef);
                    docSnap.forEach(async (oneDoc) => {
                        const newRef = doc(db, "users", oneDoc.id);
                        await deleteDoc(newRef);
                    })
                }
            }
            // Sending notification to manager which employees they have removed
            await sendNotificationToManager(arrayOfName, oneUser.UserID, "Delete");
        } catch (error) {
            console.log(error);
        }
    }
    async function sendNotificationToManager(arrayOfName, userID, typeOfNotification) {
        // Choose which notifcation message to send to Manager
        let strOfName = arrayOfName.join(", ");
        let notificationAnswer;
        if (typeOfNotification === "Approved") {
            notificationAnswer = "You have approved " + strOfName + " to the team.";
        } else if (typeOfNotification === "Delete") {
            notificationAnswer = "You have removed " + strOfName + " from the team.";
        }
        const docRefUser = query(userCollection, where("UserID", "==", userID));
        const docSnapUser = await getDocs(docRefUser);
        docSnapUser.forEach(async (oneDoc) => {
            const newRef = doc(db, "users", oneDoc.id);
            const notificationRef = collection(newRef, "notifications");
            addDoc(notificationRef, {
                Timestamp: serverTimestamp(),
                Notification: notificationAnswer,
                UserID: userID,
                isViewed: false
            })
        })
    }
    async function authenticateUserToCompany(uniqueCode, companyName) {
        // Get the Company Name from the Unique Code (in case some companies name are identical)
        let finalCompanyName = "";
        let companies = await getCodeCollection(companyCodeCollection);
        for (var i = 0; i < companies.length; i++) {
            if (companies[i].CompanyCode === uniqueCode) {
                finalCompanyName = companies[i].Company;
            }
        }
        if (uniqueCode === "") {
            finalCompanyName = companyName;
        }
        return Promise.resolve(finalCompanyName);
    }
    async function validation(uniqueCode) {
        // Validate whether the unique code exist in the database before form submission
        let exist = false;
        if (uniqueCode === "") {
            exist = true;
        }
        let companies = await getCodeCollection(companyCodeCollection);
        for (var i = 0; i < companies.length; i++) {
            if (companies[i].CompanyCode === uniqueCode) {
                exist = true;
            }
        }
        return exist;
    }
    function assignRoles(userID, email, name, phoneNumber, companyName, uniqueCode, companyCode) {
        // Assign roles based on the role: Employee/Manager
        let data = {};
        if (uniqueCode === "") {
            data = {
                UserID: userID,
                UserEmail: email,
                UserName: name,
                UserPhoneNumber: phoneNumber,
                CompanyName: companyName,
                CompanyCode: companyCode,
                Status: "Approved",
                Role: "Manager"
            }
        } else {
            data = {
                UserID: userID,
                UserEmail: email,
                UserName: name,
                UserPhoneNumber: phoneNumber,
                CompanyName: companyName,
                CompanyCode: uniqueCode,
                Status: "Not Approved",
                Role: "Employee"
            }
        }
        return data;
    }
    function assignNotification(userID, uniqueCode, companyCode) {
        // Assign notifications based on the role; Employee/Manager
        let data = {};
        if (uniqueCode === "") {
            data = {
                UserID: userID,
                Timestamp: serverTimestamp(),
                Notification: "You have successfully signed up as a Manager! This will be your unique code: " + companyCode + ".",
                isViewed: false
            }
        } else {
            data = {
                UserID: userID,
                Timestamp: serverTimestamp(),
                Notification: "You have successfully signed up as an Employee! Please wait for your manager approval.",
                isViewed: false
            }
        }
        return data;
    }
    async function getNotifications(userID) {
        // Get all Notifications from specific ID and display in the Home Page
        console.log("Getting Notifications for User")
        let notifications = [];
        let subcollectionRef;
        let subcollectionQuery;
        try {
            return new Promise((resolve) => {
                const docRef = query(userCollection, where("UserID", "==", userID));
                onSnapshot(docRef, async (querySnapshot) => {
                    querySnapshot.docs.map(async (doc) => {
                        subcollectionRef = collection(doc.ref, "notifications");
                        subcollectionQuery = query(
                            subcollectionRef,
                            where("UserID", "==", userID),
                            orderBy("Timestamp", "desc")
                        );
                    })
                    const subcollectionNotification = await getDocs(subcollectionQuery);
                    subcollectionNotification.forEach((subDoc) => {
                        let data = subDoc.data();
                        if (data.isViewed === false) {
                            notifications.push({
                                Timestamp: data.Timestamp,
                                Notification: data.Notification,
                                UserID: data.UserID,
                                isViewed: data.isViewed
                            });
                        }
                    });
                    console.log(notifications);
                    resolve(notifications);
                })
            })
        } catch (error) {
            console.log(error);
        }
    }
    async function updateNotificationView(userID) {
        // Update Notification View after clicking on "Mark All As Read" Button
        console.log("Entered Mark All As Read Button");
        let confirmation = false;
        let subcollectionRef;
        let subcollectionQuery;
        try {
            return new Promise((resolve) => {
                const docRef = query(userCollection, where("UserID", "==", userID));
                onSnapshot(docRef, async (querySnapshot) => {
                    querySnapshot.docs.map(async (doc) => {
                        subcollectionRef = collection(doc.ref, "notifications");
                        subcollectionQuery = query(
                            subcollectionRef,
                            where("UserID", "==", userID)
                        );
                    })
                    const subcollectionNotification = await getDocs(subcollectionQuery);
                    subcollectionNotification.forEach(async (subDoc) => {
                        let data = subDoc.data();
                        if (data.isViewed === false) {
                            await updateDoc(subDoc.ref, {
                                isViewed: true
                            })
                        }

                    });
                    confirmation = true;
                    resolve(confirmation);
                })
            })
        } catch (error) {
            console.log(error);
        }
    }
    async function signUp(email, password, name, phoneNumber, companyName, uniqueCode) {
        // Sign Up using normal email (seperate manager and employee role)
        console.log("Entered Sign Up (Normal Email)");
        let confirmation = false;
        try {
            return new Promise((resolve) => {
                createUserWithEmailAndPassword(auth, email, password).then(async (result) => {
                    const user = result.user;
                    const userID = user.uid;
                    const companyCode = companyCodeGenerator(companyName);
                    await authenticateUserToCompany(uniqueCode, companyName).then(async (companyConfirmName) => {
                        await addDoc(userCollection, assignRoles(userID, email, name, phoneNumber, companyConfirmName, uniqueCode, companyCode)).then(async (docRef) => {
                            // Codes for referencing from User to Notification
                            const userRef = doc(db, "users", docRef.id);
                            const notificationRef = collection(userRef, "notifications");
                            //
                            await addDoc(notificationRef, assignNotification(userID, uniqueCode, companyCode));
                        });
                    })
                    confirmation = true;
                    resolve(confirmation);
                });
            })
        } catch (error) {
            console.log(error);
        }
    }
    async function signUpWitCredentials(name, phoneNumber, companyName, uniqueCode) {
        // Sign Up using Google email (seperate manager and employee role)
        console.log("Entered Sign Up (Google Email)");
        let result = false;
        try {
            return new Promise((resolve) => {
                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        const companyCode = companyCodeGenerator(companyName);
                        await authenticateUserToCompany(uniqueCode, companyName).then(async (companyConfirmName) => {
                            await addDoc(userCollection, assignRoles(user.uid, user.email, name, phoneNumber, companyConfirmName, uniqueCode, companyCode)).then(async (docRef) => {
                                // Codes for referencing from User to Notification 
                                const userRef = doc(db, "users", docRef.id);
                                const notificationRef = collection(userRef, "notifications");
                                // 
                                await addDoc(notificationRef, assignNotification(user.uid, uniqueCode, companyCode));
                            });
                        })
                        result = true;
                        resolve(result);
                    }
                });
            })
        } catch (error) {
            console.log(error);
        }
    }
    function logIn(email, password) {
        // Log In using normal email and password
        // Exist will always be false if the User ID does not exist in the userCollection
        let exist = false;
        return signInWithEmailAndPassword(auth, email, password).then(async (result) => {
            console.log("Entered with Normal Log In");
            let user = result.user;
            // This method is to check whether the Normal Email exist within ShiftMaster FireBase
            let users = await getCodeCollection(userCollection);
            for (var i = 0; i < users.length; i++) {
                if (users[i].UserID === user.uid) {
                    // It will return Exist to be true if the User ID exist in the userCollection
                    exist = true;
                }
            }
            return Promise.resolve(exist);
        });
    }
    async function googleSignIn() {
        // Log in using Google email
        const googleAuthProvider = new GoogleAuthProvider();
        // Exist will always be false if the User ID does not exist in the userCollection
        let exist = false;
        try {
            return await signInWithPopup(auth, googleAuthProvider).then(async (result) => {
                console.log("Entered with Google Pop Up");
                const user = result.user;
                // This method is to check whether the Google Email exist within ShiftMaster FireBase
                let users = await getCodeCollection(userCollection);
                for (var i = 0; i < users.length; i++) {
                    if (users[i].UserID === user.uid) {
                        // It will return Exist to be true if the User ID exist in the userCollection
                        exist = true;
                    }
                }
                return Promise.resolve(exist);
            });
        } catch (error) {
            console.log(error);
        }
    }
    function logOut() {
        // Remove User Current Session (When Press Log Out or Back Button)
        signOut(auth).then((result) => {
            window.location.reload();
            console.log(result);
        }).catch((e) => { console.log(e) })
    }
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
            console.log("User: ", currentuser);
            setUser(currentuser);
            setLoading(false);// Set loading to false when authentication state is resolved
        });
        return () => {
            unsubscribe();
        };
    }, []);
    return (
        <userAuthContext.Provider value={{ user, logIn, signUp, logOut, googleSignIn, signUpWitCredentials, validation, getUserProfile, getAllEmployees, approveEmployees, deleteEmployees, updateUserProfile, getNotifications, updateNotificationView, loading }}>
            {children}
        </userAuthContext.Provider>
    );
}

export function useUserAuth() {
    return useContext(userAuthContext);
}