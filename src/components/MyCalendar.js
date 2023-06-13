import React, { useState } from "react";

import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";

/**
 * TODOS
 * 1. Make the event draggable
 * 2. Should be able to resize the length of the bar (eg; extend from day 1 to day 2)
 */

// dummy events
const events = [
  {
    start: new Date(2023, 5, 1, 10, 0),
    end: new Date(2023, 5, 1, 12, 0),
    title: "Meeting",
  },
  // Add more events as needed
];

const MyCalendar = () => {
  return (
    <div>
      <Calendar
        localizer={momentLocalizer(moment)} // Specify the localizer (Moment.js in this example)
        events={events} // Pass the events data
        startAccessor="start" // Specify the property name for the start date/time
        endAccessor="end" // Specify the property name for the end date/time
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
};

export default MyCalendar;
