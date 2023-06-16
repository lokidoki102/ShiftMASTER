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
import { Modal } from "react-bootstrap";

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Modal
  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

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

  const onSelectSlot = useCallback((slotInfo) => {
    console.log(slotInfo.start);
    console.log(slotInfo.end);
    openModal();
  }, []);


  //   const onSelectSlot = async ({ start, end }) => {
  //     const newShift = {
  //         title: 'New Shift',
  //         start,
  //         end,
  //       };

  //       try {
  //         // Add the new event to Firestore
  //         const docRef = await addDoc(collection(db, 'shift'), newShift);
  //         console.log('Event added with ID:', docRef.id);

  //         // Fetch the updated events from Firestore
  //         fetchEvents(start, end);
  //       } catch (error) {
  //         console.error('Error adding event:', error);
  //       }
  //   };

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
        // onSelecting={onSelecting}
        onSelectSlot={onSelectSlot}
        selectable
        style={{
          height: "500px",
          width: "500px",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      />

      <Modal isOpen={showModal} onRequestClose={closeModal}>
        <h2>Modal Title</h2>
        <p>Modal content goes here...</p>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
}; // end of MyCalendar

export default MyCalendar;
