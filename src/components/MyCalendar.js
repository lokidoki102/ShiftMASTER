import React, { Component, useCallback, useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Modal, Button, Form } from "react-bootstrap";

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [start, setStart] = useState({}); // the start datetime of the new shift
  const [end, setEnd] = useState({}); // the end datetime of the new shift
  const [newShift, setNewShift] = useState([]); // the new shift created
  const [selectedDate, setSelectedDate] = useState(null); // the clicked date
  const [currentView, setCurrentView] = useState("");

  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Pagination for fetching events
  useEffect(() => {
    const todayDate = new Date(); // Set the initial visible start date
    const initialStartDate = moment(todayDate).subtract(16, "days").toDate(); // Show 31 days
    const initialEndDate = moment(todayDate).add(16, "days").toDate(); // Show 31 days

    fetchEvents(initialStartDate, initialEndDate);
  }, []);

  //  Query for shifts
  const fetchEvents = useCallback((start, end) => {
    const eventsRef = collection(db, "shift");
    const q = query(
      eventsRef,
      where("start", ">=", start),
      where("start", "<", end),
      orderBy("start")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedEvents = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        fetchedEvents.push({
          id: doc.id,
          title: eventData.title,
          start: eventData.start.toDate(),
          end: eventData.end.toDate(),
        });
        console.log("printing title:");
        console.log(eventData.title);
      });

      setEvents(fetchedEvents);
    });

    return () => unsubscribe();
  }, []);

  //   const handleRangeChange = useCallback((start, end) => {
  //     fetchEvents(start, end);
  //   }, [fetchEvents]);

  // event handlers for calendar
  const onEventDrop = (data) => {
    const { start, end } = data;
    const updatedEvents = [
      {
        ...events[0],
        start,
        end,
      },
      ...events.slice(1),
    ];
    setEvents(updatedEvents);
  };

  const onEventResize = (data) => {
    const { start, end } = data;
    const updatedEvents = [
      {
        ...events[0],
        start,
        end,
      },
      ...events.slice(1),
    ];
    setEvents(updatedEvents);
  };

  // Called when you select a date.
  // This method is used for keeping track which day was selected
  // so the right shift can be retrieved later on.
  const onNavigate = (newDate) => {
    console.log("navigating....");
    console.log(newDate);
    setSelectedDate(newDate);
  };

  // Called when changing views between month/day/week
  const onView = (view) => {
    if (view === "day") {
      console.log("viewing day...");
      // Retrieve the current selected date when switching to the "Day" view
      const currentDate = new Date(); // Replace with your logic to get the selected date
      console.log(currentDate.toLocaleString());
      setSelectedDate(currentDate);
      setCurrentView("day");
    }

    if (view === "month") {
      setCurrentView("month");
    }

    if (view === "week") {
      setCurrentView("week");
    }
  };

  const onSelectSlot = async ({ start, end }) => {
    if (currentView == "day" || currentView == "week") {
      //TODO this should only be for day view
      setStart(start);
      setEnd(end);
      handleShow();
      setNewShift({
        title: "New Shift",
        start,
        end,
      });
    }
  };

  const saveShift = async (newShift) => {
    try {
      // Add the new event to Firestore
      const docRef = await addDoc(collection(db, "shift"), newShift);
      console.log("Event added with ID:", docRef.id);
      handleClose();

      // Refresh the shifts again for this date.
      const initialStartDate = moment(selectedDate)
        .subtract(1, "days")
        .toDate(); // +- 1 day because range is exclusive
      const initialEndDate = moment(selectedDate).add(1, "days").toDate();
      fetchEvents(initialStartDate, initialEndDate);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  return (
    <div>
      <DnDCalendar
        localizer={localizer} // Specify the localizer (Moment.js in this example)
        events={events} // Pass the events data
        startAccessor="start" // Specify the property name for the start date/time
        endAccessor="end" // Specify the property name for the end date/time
        draggableAccessor={(event) => true}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onNavigate={onNavigate}
        onView={onView}
        // onSelecting={onSelecting}
        onSelectSlot={onSelectSlot}
        selectable
        style={{
          height: "800px",
          width: "1000px",
          justifyContent: "center",
          alignItems: "center",
        }}
      />

      <Modal
        show={show}
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
              Testing
              <h1>Start {start.toLocaleString()}</h1>
              <h1>End {end.toLocaleString()}</h1>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => saveShift(newShift)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}; // end of MyCalendar

export default MyCalendar;
