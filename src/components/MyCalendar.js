import React, { Component, useCallback, useState } from "react";

import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useRef } from "react";

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);
// TODO Add a way to add dummy events from the UI itself

const MyCalendar = () => {
  // Dummy events
  const [events, setEvents] = useState([
    {
      start: new Date(2023, 5, 1, 10, 0),
      end: new Date(2023, 5, 1, 12, 0),
      title: "Meeting",
    },
  ]);

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

  const onSelecting = ({ start, end }) => {
    // TODO
    // 1. Upon selection, the event should stay
    // 2.
    console.log("Selecting:", start, end);
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
        onSelecting={onSelecting}
        //   onSelectSlot={this.onSelectSlot}
        selectable
        style={{
          height: "500px",
          width: "500px",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      />
    </div>
  );
}; // end of MyCalendar

export default MyCalendar;
