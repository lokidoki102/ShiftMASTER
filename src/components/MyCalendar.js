import React, { useCallback, useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  collectionGroup,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Modal, Button, Form } from "react-bootstrap";
import "rc-time-picker/assets/index.css";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import "../App.css";
import { useUserAuth } from "../context/UserAuthContext";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { motion } from "framer-motion/dist/framer-motion";

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const { user } = useUserAuth();
  const [currentUserDocID, setCurrentUserID] = useState(""); // the userID of the one logged in
  const [selectedUserDocID, setSelectedUserDocID] = useState("");
  const [selectedUserID, setSelectedUserID] = useState("");
  const [prvsSelectedValue, setprvsSelectedValue] = useState("");
  const [isNewValue, setIsNewValue] = useState(false);
  //   const [newShiftDocID, setNewShiftDocID] = useState("");
  const [name, setName] = useState("");
  const [isApproved, setIsApproved] = useState("");
  const [role, setRole] = useState("");
  const [CompanyCode, setCompanyCode] = useState("");
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [start, setStart] = useState(new Date()); // the start datetime of the new shift
  const [end, setEnd] = useState(new Date()); // the end datetime of the new shift
  const [newShift, setNewShift] = useState([]); // the new shift created
  const [selectedDate, setSelectedDate] = useState(null); // the clicked date
  const [currentView, setCurrentView] = useState("");

  // Calendar
  const views = {
    month: true,
    week: true,
    day: true,
  };
  const [showConfirmBtn, setShowConfirmBtn] = useState(false);
  const [showDropDown, setDropDown] = useState(false);

  const shiftStyleGetter = (shift, start, end, isSelected) => {
    const backgroundColor = shift.isConfirmed ? "#67C381" : "#EC8787";
    const borderColor = isSelected ? "white" : backgroundColor;

    return {
      style: {
        backgroundColor,
        borderColor,
      },
    };
  };

  const CustomToolbar = ({ date, view, onView, onNavigate }) => {
    const handleViewChange = (newView) => {
      onView(newView);
    };

    const handleTodayClick = () => {
      onNavigate("TODAY");
    };

    const handleNextClick = () => {
      onNavigate("NEXT");
    };

    const handleBackClick = () => {
      onNavigate("PREV");
    };

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginBottom: "10px",
        }}
      >
        <div>
          <span className="rbc-btn-group" style={{ paddingLeft: "5px" }}>
            {/* default buttons */}
            <Button
              variant={view === "month" ? "dark" : "outline-dark"}
              onClick={() => handleViewChange("month")}
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "dark" : "outline-dark"}
              onClick={() => handleViewChange("week")}
            >
              Week
            </Button>
            <Button
              variant={view === "day" ? "dark" : "outline-dark"}
              onClick={() => handleViewChange("day")}
            >
              Day
            </Button>
          </span>
        </div>
        <div>
          <span className="rbc-toolbar-label">
            {localizer.format(date, "LLLL yyyy")}
          </span>
        </div>
        <div>
          {/* additional buttons */}
          <span className="rbc-btn-group">
            <Button variant="outline-dark" onClick={handleTodayClick}>
              Today
            </Button>
            <Button variant="outline-dark" onClick={handleBackClick}>
              Back
            </Button>
            <Button variant="outline-dark" onClick={handleNextClick}>
              Next
            </Button>
          </span>
        </div>
      </div>
    );
  };

  // Loading animation
  const [loading, setLoading] = useState(true);

  const loadingContainer = {
    width: "4rem",
    height: "4rem",
    display: "flex",
    justifyContent: "space-around",
  };
  const loadingCircle = {
    display: "block",
    width: "1rem",
    height: "1rem",
    backgroundColor: "#2F2E2E",
    borderRadius: "0.5rem",
  };

  const loadingContainerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const loadingCircleVariants = {
    start: {
      y: "0%",
    },
    end: {
      y: "60%",
    },
  };
  const loadingCircleTransition = {
    duration: 0.4,
    yoyo: Infinity,
    ease: "easeInOut",
  };

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false); // for delete button
  const [showCreate, setShowCreate] = useState(false); // for create button
  const handleClose = () => {
    setShowModal(false);
    setShowDelete(false);
    setShowCreate(false);
  };
  const handleShow = () => setShowModal(true);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // time picker
  const onChangeStart = (date) => {
    setNewShift((prevShift) => ({
      ...prevShift,
      start: date,
    }));
    setStart(date);
  };
  const onChangeEnd = (date) => {
    setNewShift((prevShift) => ({
      ...prevShift,
      end: date,
    }));
    setEnd(date);
  };
  // ---- end of time picker ----

  useEffect(() => {
    retrieveShift(16, 16);
  }, []);

  const retrieveShift = (min, max) => {
    const todayDate = new Date(); // Set the initial visible start date
    const initialStartDate = moment(todayDate).subtract(min, "days").toDate(); // Show 31 days
    const initialEndDate = moment(todayDate).add(max, "days").toDate(); // Show 31 days

    queryShifts(initialStartDate, initialEndDate);
  };

  // Query for shifts
  const queryShifts = useCallback((start, end) => {
    const q = query(collection(db, "users"), where("UserID", "==", user.uid));

    console.log("(queryShifts): user.uid:", user.uid);
    setLoading(true);
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedShifts = [];
      // Manager: show all shifts available in the company
      await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          setCurrentUserID(doc.id.toString());
          setName(doc.data().UserName.toString());
          console.log("Document ID:", doc.id);
          console.log("Document data:", doc.data());
          const isApproved = doc.data().Status.toString(); // retrieve status
          setIsApproved(isApproved);
          const role = doc.data().Role.toString();
          setRole(role);
          const CompanyCode = doc.data().CompanyCode.toString();
          setCompanyCode(CompanyCode);
          let subcollectionRef = null;
          let subcollectionQuery = null;
          // Employee: Show only his/her own shifts
          console.log("(queryShifts) role:", role);

          if (role === "Employee") {
            subcollectionRef = collection(doc.ref, "shifts");

            subcollectionQuery = query(
              subcollectionRef,
              where("UserID", "==", user.uid),
              where("start", ">=", start),
              where("start", "<", end),
              where("isVisible", "==", true),
              orderBy("start")
            );
          }
          // Manager: Show all the shifts under the company
          else if (role === "Manager") {
            // show all shifts
            subcollectionRef = collectionGroup(db, "shifts");

            subcollectionQuery = query(
              subcollectionRef,
              where("start", ">=", start),
              where("start", "<", end),
              where("isVisible", "==", true),
              where("CompanyCode", "==", CompanyCode),
              orderBy("start")
            );

            setDropDown(true);
            // setShowConfirmBtn(true);
            queryEmployees(CompanyCode);
          } else {
            console.log("Role not found");
            return;
          }

          const subcollectionSnapshot = await getDocs(subcollectionQuery);

          subcollectionSnapshot.forEach((subdoc) => {
            const shiftData = subdoc.data();
            fetchedShifts.push({
              userDocID: subdoc.ref.parent.parent.id,
              id: subdoc.id,
              UserID: shiftData.UserID,
              title: shiftData.title,
              start: shiftData.start.toDate(),
              end: shiftData.end.toDate(),
              isConfirmed: shiftData.isConfirmed,
            });
          });
        })
      );
      setShifts(fetchedShifts);
      setLoading(false);
      // console.log("The shifts are:",shifts)
    });
    return () => unsubscribe();
  }, []);

  // Query for getting employee names
  const queryEmployees = async (CompanyCode) => {
    const fetchedEmployees = [];
    const q = query(
      collection(db, "users"),
      where("CompanyCode", "==", CompanyCode)
    );

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const employee = {
          id: doc.data().UserID,
          docID: doc.id,
          name: doc.data().UserName,
        };
        fetchedEmployees.push(employee);
      });
    } catch (error) {
      console.error("Error querying employees:", error);
    }

    setEmployees(fetchedEmployees);
  };

  // --- Event handlers for calendar ---
  //   const onEventDrop = (data) => {
  //     const { start, end } = data;
  //     console.log(data);

  //     const updatedEvents = shifts.map((shift) => {
  //       // Check if the current shift has the same id as the dragged event
  //       if (shift.id === data.event.id) {
  //         // Update the start and end times for the dragged event
  //         return {
  //           ...shift,
  //           start,
  //           end,
  //         };
  //       } else {
  //         // For other shifts, just return them as they are (no update needed)
  //         return shift;
  //       }
  //     });

  //     console.log("UpdatedEvents:", updatedEvents);
  //     setShifts(updatedEvents);
  //   };

  //   const onEventResize = (data) => {
  //     const { start, end } = data;
  //     const updatedEvents = [
  //       {
  //         ...shifts[0],
  //         start,
  //         end,
  //       },
  //       ...shifts.slice(1),
  //     ];
  //     setShifts(updatedEvents);
  //   };

  // Called when you select a date.
  // This method is used for keeping track which day was selected
  // so the right shift can be retrieved later on.
  const onNavigate = (newDate) => {
    console.log(newDate);
    setSelectedDate(newDate);
  };

  // Called when changing views between month/day/week
  const onView = (view) => {
    if (view === "day") {
      // Retrieve the current selected date when switching to the "Day" view
      const currentDate = new Date(); // Replace with your logic to get the selected date
      console.log(currentDate.toLocaleString());
      setSelectedDate(currentDate);
      setCurrentView("day");

      if (role === "Manager") {
        // Show confirm all button
        setShowConfirmBtn(true);
        setDropDown(true);
      }
    }

    if (view === "month") {
      //   retrieveShift(16, 16);
      setShowConfirmBtn(false);
      setCurrentView("month");
      setDropDown(true);
    }

    if (view === "week") {
      setShowConfirmBtn(false);
      setCurrentView("week");
      setDropDown(true);
    }
  };

  // triggered when slot/s from day/week view is selected
  const onSelectSlot = async ({ id, start, end }) => {
    // if user is not approved, show warning
    if (role === "Employee" && isApproved === "Not Approved") {
      // show a warning message
      console.log(isApproved);
      console.log("Not approved... showing warning now");
      setToastMessage("Please wait until you're approved by your manager.");
      setShowToast(true);
      return;
    }
    if (currentView === "day" || currentView === "week") {
      //TODO title should be the person's name
      setStart(start);
      setEnd(end);
      handleShow();
      setNewShift({
        userDocID: currentUserDocID,
        CompanyCode: CompanyCode,
        title: name,
        start,
        end,
        isVisible: true,
        UserID: user.uid,
        isConfirmed: false, // by default should be false as the manager has to approve it first
      });

      setShowCreate(true);
    }
  };

  // triggered when a shift from the calendar is selected
  const onSelectEvent = ({
    id,
    start,
    end,
    isConfirmed,
    UserID,
    userDocID,
    title,
  }) => {
    // 1. Create new shift as a manager > change the employee straight away
    console.log("(onSelectEvent)ID: " + id);
    console.log("(onSelectEvent)UserID: " + UserID);
    console.log("(onSelectEvent)isConfirmed: " + isConfirmed);
    // store selected event's start and end times
    setStart(start);
    setEnd(end);
    setSelectedUserDocID(userDocID);
    setprvsSelectedValue(userDocID);
    console.log("currentUserDocID:", userDocID);
    setNewShift({
      userDocID,
      id,
      CompanyCode: CompanyCode,
      title,
      start,
      end,
      UserID,
      isConfirmed,
    });

    // show modal
    setShowDelete(true);
    handleShow();
  };

  // adding shifts into the firebase
  const createShift = async (newShift, userDocID, title, isUpdating) => {
    try {
      handleClose();
      setLoading(true);
      console.log("(createShift)ususerDocIDer:", userDocID);
      // Reference to this user's document
      const userRef = doc(db, "users", userDocID);
      // Reference to this user's shifts subcollection
      const shiftsCollectionRef = collection(userRef, "shifts");

      if (title !== "") {
        newShift.title = title;
      }

      const batch = writeBatch(db);

      console.log("(createShift) isNewValue:", isNewValue, isUpdating);
      if (isNewValue && isUpdating) {
        const newRef = await addDoc(shiftsCollectionRef, newShift);

        const newID = newRef.id;
        console.log("newID:", newID);

        const oldID = newShift.id;
        console.log("oldID:", oldID);

        // Add the newShiftDocID to the newShift object
        newShift.id = newID;

        // Save the newShift object to Firestore
        batch.set(newRef, newShift);

        // Commit the batch
        await batch.commit();

        //TODO The old shift is not getting removed for some reason(client side, server side seems to be working)
        const shiftToBeRemoved = shifts.find((shift) => shift.id === oldID);
        if (shiftToBeRemoved) {
          console.log("Shift ID to be removed:", shiftToBeRemoved.id);
        }
        const newArray = shifts.filter((shift) => shift.id !== oldID); // filter out the shift that is getting updated
        newArray.push(newShift); // add the shift that was updated into the new array
        setShifts(newArray);
        console.log("newArray:", newArray);
      } else {
        console.log("(createShift) role:", role);
        if (role === "Manager" && selectedUserID !== "" && isNewValue) {
          console.log("(createShift) selectedUserID:", selectedUserID);
          newShift.UserID = selectedUserID;
        }
        const newRef = await addDoc(shiftsCollectionRef, newShift);

        newShift.id = newRef.id; // this is just so the client side is able to tell what's the id of this newly created shift
        console.log("newShift", newShift);
        // await addDoc(shiftsCollectionRef, newShift);
        // shifts.push(newShift); //TODO This doesnt seem to work

        const a = [].concat(shifts, newShift);
        setShifts(a);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error adding event:", error);
    }
  };

  const saveShift = async (updatedShift) => {
    try {
      if (updatedShift.isConfirmed) {
        handleClose();
        setToastMessage("Unable to edit confirmed shifts");
        setShowToast(true);
        return;
      }
      setLoading(true);
      handleClose();

      console.log("updatedShift.userDocID", updatedShift.userDocID);
      console.log("selectedValue:", selectedUserDocID);
      console.log("isNewValue:", isNewValue);
      // Compare if there's a change in the selected employee for the shift
      if (isNewValue) {
        console.log(
          "Should be same as oldID --> updatedShift.id:",
          updatedShift.id
        );
        // delete the previous document using the old userid
        // await deleteShift(updatedShift);
        const userRef = doc(db, "users", prvsSelectedValue);
        const shiftRef = doc(collection(userRef, "shifts"), updatedShift.id);
        updatedShift.isVisible = false;
        console.log("shiftRef.path:", shiftRef.path);
        await updateDoc(shiftRef, updatedShift);
        // setprvsSelectedValue(selectedValue);

        // make a new document using the new userid
        console.log(updatedShift);
        updatedShift.isVisible = true; // Set isVisible back to true as it was set to false to 'delete' the previous document
        updatedShift.UserID = selectedUserID;
        console.log("(saveShift) updatedShift.UserID:", selectedUserID);

        let userDocID = "";
        let title = "";

        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          if (doc.data().UserID === selectedUserDocID) {
            // Reference to this user document
            userDocID = doc.id;
            title = doc.data().UserName;
          }
        });
        console.log("userDocID:", selectedUserDocID);
        setLoading(true);
        await createShift(updatedShift, selectedUserDocID, title, true);
        setLoading(false);
        setIsNewValue(false);
      } else {
        const userRef = doc(db, "users", selectedUserDocID);

        // Reference to this user's shifts subcollection
        const ref = doc(collection(userRef, "shifts"), updatedShift.id);
        // Update the shift in Firestore
        setLoading(true);
        await updateDoc(ref, updatedShift);
        setLoading(false);
        const newArray = shifts.filter((shift) => shift.id !== updatedShift.id); // filter out the shift that is getting updated
        newArray.push(updatedShift); // add the shift that was updated into the new array
        setShifts(newArray);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error updating event:", error);
      setLoading(false);
    }
  };

  const deleteShift = async (updatedShift) => {
    try {
      setLoading(true);
      handleClose();
      updatedShift.isVisible = false; // Set isVisible to false

      // Reference to this user's shifts subcollection
      console.log("Deleting", updatedShift.userDocID);
      const shiftRef = doc(
        db,
        "users",
        updatedShift.userDocID,
        "shifts",
        updatedShift.id
      );

      // Update the shift in Firestore
      await updateDoc(shiftRef, updatedShift);

      // Refresh the shifts in the calendar
      console.log("Removing from array:", updatedShift.id);
      const newArray = shifts.filter((shift) => shift.id !== updatedShift.id); // filter out the shift that is getting updated
      setShifts(newArray);
      newArray.forEach((shift) => {
        console.log(shift.id);
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error deleting event:", error);
    }
  };

  // confirm a shift
  const confirmShift = async (shift) => {
    handleClose();
    setLoading(true);
    shift.isConfirmed = true;

    if (isNewValue) {
      setToastMessage(
        "Unable to confirm shift due to change in employee. Please update the selected shift first before confirming."
      );
      setShowToast(true);
      setLoading(false);
      return;
    }

    const shiftRef = doc(db, "users", shift.userDocID, "shifts", shift.id);

    await updateDoc(shiftRef, shift);

    // Refresh the shifts in the calendar
    console.log("Removing from array:", shift.id);
    const newArray = shifts.filter((s) => s.id !== shift.id); // filter out the shift that is getting updated
    newArray.push(shift);
    setShifts(newArray);
    newArray.forEach((s) => {
      console.log(s.id);
    });
    setLoading(false);
  };

  // confirm all the shifts for the particular day
  const confirmAllShifts = async () => {
    console.log("Confirming all shifts...");
    const batch = writeBatch(db);
    console.log(shifts);

    // Filter and update the shifts in the client-side
    const updatedShifts = shifts.map((shift) => {
      if (
        shift.isConfirmed ||
        !moment(shift.start).isSame(selectedDate, "day")
      ) {
        // For shifts that are already confirmed or don't match the selected date, return them as they are
        return shift;
      } else {
        // For shifts that need to be confirmed, update the isConfirmed property to true
        return {
          ...shift,
          isConfirmed: true,
        };
      }
    });

    console.log("Updated shifts:", updatedShifts);

    // Create batch updates for the shifts that need to be confirmed
    updatedShifts.forEach((shift) => {
      if (shift.isConfirmed) {
        // Update shifts
        const shiftRef = doc(db, "users", shift.userDocID, "shifts", shift.id);
        const updatedShiftData = {
          isConfirmed: true,
        };
        batch.update(shiftRef, updatedShiftData);

        //  Send notification
        console.log(
          "Notificaiton:",
          "Your shift from " +
            shift.start.toJSON().slice(0, 10) +
            " to: " +
            shift.end.toJSON().slice(0, 10) +
            " has been approved."
        );
        const notificationData = {
          Timestamp: serverTimestamp(),
          Notification:
            "Your shift from " +
            shift.start.toJSON().slice(0, 10) +
            " to: " +
            shift.end.toJSON().slice(0, 10) +
            " has been approved.",
          UserID: shift.UserID,
          isViewed: false,
        };
        console.log("shift.userDocID:", shift.userDocID);
        const userRef = doc(db, "users", shift.userDocID);
        const notificationRef = collection(userRef, "notifications");
        console.log("notificationRef.path", notificationRef.path);

        addDoc(notificationRef, notificationData);
      }
    });

    // Set the updated shifts array in the state to reflect the changes in the UI
    setShifts(updatedShifts);

    // Commit the batch updates to the server
    await batch.commit();
  };

  // Event listener for dropdown for employee's name
  const handleDropdownChange = (event) => {
    const newValue = event.target.value;
    console.log("event.target.value:", newValue);
    setSelectedUserDocID(newValue);

    // Check if there's a change in selected value
    if (newValue !== prvsSelectedValue) {
      // Do something here with the new selected value
      setSelectedUserDocID(newValue);
      setIsNewValue(true);
      console.log("Selected value changed:", newValue);
    } else {
      setIsNewValue(false);
    }

    // Get the selected option's index
    const selectedIndex = event.target.selectedIndex;

    // Access the employee object from the employees array
    const selectedEmployee = employees[selectedIndex - 1]; // Minus 1 to account for the "Select an employee" option

    // Access the key value (employee.id)
    const key = selectedEmployee.id;
    setSelectedUserID(key);
    console.log("(handleDropdownChange) SelectedUserID:", key);
    newShift.title = employees.find(
      (employee) => employee.docID === newValue
    ).name;
    console.log("newShift.title:", newShift.title);
    newShift.userDocID = employees.find(
      (employee) => employee.docID === newValue
    ).docID;
    console.log("newShift.userDocID", newShift.userDocID);
  };

  return (
    <div class="container">
      {loading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
          <div className="fixed  w-full min-h-screen z-50 opacity-5">
            <div className="flex fixed w-full justify-center items-center h-screen">
              <motion.div
                style={loadingContainer}
                variants={loadingContainerVariants}
                initial="start"
                animate="end"
              >
                <motion.span
                  style={loadingCircle}
                  variants={loadingCircleVariants}
                  transition={loadingCircleTransition}
                ></motion.span>
                <motion.span
                  style={loadingCircle}
                  variants={loadingCircleVariants}
                  transition={loadingCircleTransition}
                ></motion.span>
                <motion.span
                  style={loadingCircle}
                  variants={loadingCircleVariants}
                  transition={loadingCircleTransition}
                ></motion.span>
              </motion.div>
            </div>
          </div>
        </div>
      )}
      <div class="row">
        <div class="d-flex justify-content-center">
          <DnDCalendar
            localizer={localizer} // Specify the localizer (Moment.js in this example)
            events={shifts} // Pass the events data
            startAccessor="start" // Specify the property name for the start date/time
            endAccessor="end" // Specify the property name for the end date/time
            draggableAccessor={(event) => true}
            // onEventDrop={onEventDrop}
            eventPropGetter={shiftStyleGetter}
            // onEventResize={onEventResize}
            onNavigate={onNavigate}
            onView={onView}
            views={views}
            components={{
              toolbar: CustomToolbar, // Use custom toolbar
            }}
            // onSelecting={onSelecting}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            selectable
            style={{
              height: "800px",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          />
          <ToastContainer
            position="top-end"
            className="p-3"
            style={{ zIndex: 1 }}
          >
            <Toast
              onClose={() => setShowToast(false)}
              show={showToast}
              delay={6000}
              autohide
            >
              <Toast.Header className="bg-danger text-white">
                <img
                  src="holder.js/20x20?text=%20"
                  className="rounded me-2"
                  alt=""
                />
                <strong className="me-auto">Warning</strong>
              </Toast.Header>
              <Toast.Body className="bg-danger text-white">
                {toastMessage}
              </Toast.Body>
            </Toast>
          </ToastContainer>
          <div className="confirm-button-container">
            {showConfirmBtn && (
              <button
                variant="primary"
                className="confirm-button"
                onClick={() => confirmAllShifts()}
              >
                <div className="d-flex align-items-center">
                  <FaCheck />
                  <span style={{ marginLeft: "5px" }}>Confirm All Shifts</span>
                </div>
              </button>
            )}
          </div>

          <Modal
            show={showModal}
            onHide={handleClose}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title></Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <table>
                    <tbody>
                      <tr>
                        <td>Start</td>
                        <td>
                          <DateTimePicker
                            onChange={onChangeStart}
                            value={start}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>End</td>
                        <td>
                          <DateTimePicker onChange={onChangeEnd} value={end} />
                        </td>
                      </tr>

                      {showDropDown && (
                        <tr>
                          <td>Name</td>
                          <td>
                            <select
                              onChange={handleDropdownChange}
                              defaultValue={newShift.userDocID}
                            >
                              <option value="">Select an employee</option>
                              {employees.map((employee) => (
                                <option
                                  key={employee.id}
                                  value={employee.docID}
                                >
                                  {employee.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              {showCreate && (
                <Button
                  variant="primary"
                  onClick={() =>
                    createShift(newShift, newShift.userDocID, "", false)
                  }
                >
                  Add Shift
                </Button>
              )}
            </Modal.Footer>
            {showDelete && (
              <Modal.Footer>
                {showDelete && (
                  <Button
                    variant="danger"
                    onClick={() => deleteShift(newShift)}
                  >
                    Delete
                  </Button>
                )}

                {showDelete && (
                  <Button
                    variant="success"
                    onClick={() => confirmShift(newShift)}
                  >
                    Confirm
                  </Button>
                )}
                <Button variant="primary" onClick={() => saveShift(newShift)}>
                  Update
                </Button>
              </Modal.Footer>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
}; // end of MyCalendar

export default MyCalendar;
