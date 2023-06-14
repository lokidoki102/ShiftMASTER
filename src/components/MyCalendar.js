import React, { Component, useCallback, useState } from "react";

import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";


const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

class MyCalendar extends Component {
  // dummy events
  state = {
    events: [
      {
        start: new Date(2023, 5, 1, 10, 0),
        end: new Date(2023, 5, 1, 12, 0),
        title: "Meeting",
      },
      // Add more events as needed
    ],
  };

  // Called when after the dragged event is dropped
  onEventDrop = (data) => {
    const { start, end } = data;

    this.setState((state) => {
      this.state.events[0].start = start;
      this.state.events[0].end = end;
      return { events: [...state.events] };
    });
  };

  // Called when event is resized
  onEventResize = (data) => {
    const { start, end } = data;

    this.setState((state) => {
      this.state.events[0].start = start;
      this.state.events[0].end = end;
      return { events: [...state.events] };
    });
  };

  render() {
    return (
      <div>
        <DnDCalendar
          localizer={localizer} // Specify the localizer (Moment.js in this example)
          events={this.state.events} // Pass the events data
          startAccessor="start" // Specify the property name for the start date/time
          endAccessor="end" // Specify the property name for the end date/time
          draggableAccessor={(event) => true}
          onEventDrop={this.onEventDrop}
          onEventResize={this.onEventResize}
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
}

export default MyCalendar;
