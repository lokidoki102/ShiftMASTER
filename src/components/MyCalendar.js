import React, { Component, useCallback, useState, useEffect } from "react";
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
  commitBatch,
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

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const { user } = useUserAuth();
  const [currentUserDocID, setCurrentUserID] = useState(""); // the userID of the one logged in
  const [selectedValue, setSelectedValue] = useState("");
  const [name, setName] = useState("");
  const [isApproved, setIsApproved] = useState("");
  const [role, setRole] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
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

    if (role == "Manager") {
      // show confirm all button
    }
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
          const uniqueCode = doc.data().UniqueCode.toString();
          setUniqueCode(uniqueCode);
          let subcollectionRef = null;
          let subcollectionQuery = null;
          // Employee: Show only his/her own shifts
          if (role == "Employee") {
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
          else if (role == "Manager") {
            // show all shifts
            subcollectionRef = collectionGroup(db, "shifts");

            subcollectionQuery = query(
              subcollectionRef,
              where("start", ">=", start),
              where("start", "<", end),
              where("isVisible", "==", true),
              where("UniqueCode", "==", uniqueCode),
              orderBy("start")
            );

            queryEmployees(uniqueCode);
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

            console.log("Subdocument ID:", subdoc.id);
            console.log("Subdocument data:", subdoc.data());
          });
        })
      );
      setShifts(fetchedShifts);
    });
    return () => unsubscribe();
  }, []);

  // Query for getting employee names
  const queryEmployees = async (uniqueCode) => {
    const fetchedEmployees = [];
    const q = query(
      collection(db, "users"),
      where("UniqueCode", "==", uniqueCode)
    );

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const employee = {
          id: doc.data().UserID,
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
  const onEventDrop = (data) => {
    const { start, end } = data;
    const updatedEvents = [
      {
        ...shifts[0],
        start,
        end,
      },
      ...shifts.slice(1),
    ];
    setShifts(updatedEvents);
  };

  const onEventResize = (data) => {
    const { start, end } = data;
    const updatedEvents = [
      {
        ...shifts[0],
        start,
        end,
      },
      ...shifts.slice(1),
    ];
    setShifts(updatedEvents);
  };

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
    }

    if (view === "month") {
      retrieveShift(16, 16);
      setCurrentView("month");
    }

    if (view === "week") {
      setCurrentView("week");
    }
  };

  // triggered when slot/s from day/week view is selected
  const onSelectSlot = async ({ id, start, end, userDocID }) => {
    // if user is not approved, show warning
    if (role == "Employee" && isApproved == "Not Approved") {
      // show a warning message
      console.log(isApproved);
      console.log("Not approved... showing warning now");
      setShowToast(true);
      return;
    }
    if (currentView == "day" || currentView == "week") {
      //TODO title should be the person's name
      setStart(start);
      setEnd(end);
      handleShow();
      setNewShift({
        userDocID,
        UniqueCode: uniqueCode,
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
  const onSelectEvent = ({ id, start, end, isConfirmed, UserID, userDocID}) => {
    console.log("(onSelectEvent)ID: " + id);
    console.log("(onSelectEvent)UserID: " + UserID);
    console.log("(onSelectEvent)isConfirmed: " + isConfirmed);
    // store selected event's start and end times
    setStart(start);
    setEnd(end);
    setNewShift({
      userDocID,
      id,
      UniqueCode: uniqueCode,
      title: name,
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
  const createShift = async (newShift, userDocID, title) => {
    try {
      handleClose();
      // Reference to this user's document
      const userRef = doc(db, "users", userDocID);
      // Reference to this user's shifts subcollection
      const shiftsCollectionRef = collection(userRef, "shifts");

      if (title != "") {
        newShift.title = title;
      }

      // Add new document to the shifts subcollection
      addDoc(shiftsCollectionRef, newShift).catch((error) => {
        console.error("Error adding shift document:", error);
      });

      // Refresh the shifts
      retrieveShift(1, 1);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const saveShift = async (updatedShift) => {
    try {
      handleClose();
      // Reference to this user's document
      const userRef = doc(db, "users", currentUserDocID);
      // Reference to this user's shifts subcollection
      const shiftsCollectionRef = doc(
        collection(userRef, "shifts"),
        updatedShift.id
      );

      // Compare if there's a change in the selected employee for the shift
      if (updatedShift.UserID !== selectedValue && updatedShift.UserID != "") {
        // delete the previous document using the old userid
        await deleteShift(updatedShift);
        // make a new document using the new userid
        console.log("DATA INCOMING");
        console.log(updatedShift);
        updatedShift.isVisible = true; // Set isVisible back to true as it was set to false to 'delete' the previous document
        updatedShift.UserID = selectedValue;

        let userDocID = "";
        let title = "";

        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          if (doc.data().UserID === selectedValue) {
            // Reference to this user document
            userDocID = doc.id;
            title = doc.data().UserName;
          }
        });
        await createShift(updatedShift, userDocID, title);
      } else {
        // Update the shift in Firestore
        await updateDoc(shiftsCollectionRef, updatedShift);
      }

      // Refresh the shifts
      retrieveShift(1, 1);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const deleteShift = async (updatedShift) => {
    try {
      handleClose();
      updatedShift.isVisible = false; // Set isVisible to false
      // Reference to this user's shifts subcollection
      console.log("Deleting", updatedShift.userDocID);
      const shiftRef = doc(db, "users", updatedShift.userDocID, "shifts", updatedShift.id);

      // Update the shift in Firestore
      await updateDoc(shiftRef, updatedShift);

      // Refresh the shifts
      retrieveShift(1, 1);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // confirm all the shifts for the particular day
  const confirmAllShifts = async () => {
    const batch = writeBatch(db);
    // const batch = db.batch();

    // iterate through the shifts get all the shifts in this particular day
    shifts.forEach((shift) => {
      //  skip if shift does not belong to the current day
      if (
        shift.isConfirmed ||
        !moment(shift.start).isSame(selectedDate, "day")
      ) {
        console.log("Skipping this shift id", shift.id);
        return;
      }
      const shiftRef = doc(db, "users", shift.userDocID, "shifts", shift.id);
      console.log("updating this shift ref id:", shift.id);
      const updatedShiftData = {
        isConfirmed: true,
      };
      batch.update(shiftRef, updatedShiftData);
      // batch.set(shiftRef, updatedShiftData);
    });

    await batch.commit();
  };

  // Event listener for dropdown for employee's name
  const handleDropdownChange = (event) => {
    setSelectedValue(event.target.value);
  };

  return (
    <div>
      <DnDCalendar
        localizer={localizer} // Specify the localizer (Moment.js in this example)
        events={shifts} // Pass the events data
        startAccessor="start" // Specify the property name for the start date/time
        endAccessor="end" // Specify the property name for the end date/time
        draggableAccessor={(event) => true}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onNavigate={onNavigate}
        onView={onView}
        views={views}
        // onSelecting={onSelecting}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        selectable
        style={{
          height: "800px",
          width: "1000px",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
      <button onClick={() => confirmAllShifts(shifts)}>
        Confirm All Shifts
      </button>

      <Modal
        show={showModal}
        onHide={handleClose}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <table>
                <tbody>
                  <tr>
                    <td>Start</td>
                    <td>
                      <DateTimePicker onChange={onChangeStart} value={start} />
                    </td>
                  </tr>
                  <tr>
                    <td>End</td>
                    <td>
                      <DateTimePicker onChange={onChangeEnd} value={end} />
                    </td>
                  </tr>
                  <tr>
                    <td>Name</td>
                    <td>
                      <select
                        onChange={handleDropdownChange}
                        defaultValue={newShift.UserID}
                      >
                        <option value="">Select an employee</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {showCreate && (
            <Button
              variant="primary"
              onClick={() => createShift(newShift, currentUserDocID, "")}
            >
              Add Shift
            </Button>
          )}
        </Modal.Footer>
        {showDelete && (
          <Modal.Footer>
            {showDelete && (
              <Button variant="danger" onClick={() => deleteShift(newShift)}>
                Delete
              </Button>
            )}
            <Button variant="primary" onClick={() => saveShift(newShift)}>
              Update
            </Button>
          </Modal.Footer>
        )}
      </Modal>
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
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
            Please wait until you're approved by your manager.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}; // end of MyCalendar

export default MyCalendar;
