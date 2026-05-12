import React, { useState } from "react";
import BigCalendar from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/App.css";

// 1. Setup and capture the localizer
const localizer = BigCalendar.momentLocalizer(moment);

export default function App() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("All");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [currentSlot, setCurrentSlot] = useState(null);

  // --- Handlers ---
  const handleSelectSlot = (slotInfo) => {
    setCurrentSlot(slotInfo);
    setTitle("");
    setLocation("");
    setModalType("create");
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setLocation(event.location);
    setModalType("edit");
    setShowModal(true);
  };

  const handleSave = () => {
    if (modalType === "create") {
      const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        location,
        start: currentSlot ? currentSlot.start : new Date(),
        end: currentSlot ? currentSlot.end : new Date(),
      };
      setEvents([...events, newEvent]);
    } else if (modalType === "edit") {
      setEvents(
        events.map((ev) =>
          ev.id === selectedEvent.id ? { ...ev, title, location } : ev
        )
      );
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    setEvents(events.filter((ev) => ev.id !== selectedEvent.id));
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  // --- Display & Styling Logic ---
  const filteredEvents = events.filter((event) => {
    const isPast = moment(event.end).isBefore(moment());
    if (filter === "Past") return isPast;
    if (filter === "Upcoming") return !isPast;
    return true; // "All"
  });

  const eventPropGetter = (event) => {
    const isPast = moment(event.end).isBefore(moment());
    const backgroundColor = isPast
      ? "rgb(222, 105, 135)" // Pink for past events
      : "rgb(140, 189, 76)"; // Green for upcoming events
    return {
      style: {
        backgroundColor,
        color: "white",
        border: "none",
        borderRadius: "4px",
      },
    };
  };

  return (
    <div className="app-container">
      <h1>Event Tracker Calendar</h1>
      
      <div className="toolbar">
        <button className="btn" onClick={() => setFilter("All")}>All</button>
        <button className="btn" onClick={() => setFilter("Past")}>Past</button>
        <button className="btn" onClick={() => setFilter("Upcoming")}>Upcoming</button>
        <button className="btn" onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}>
          Create Event
        </button>
      </div>

      <div className="calendar-wrapper">
        <BigCalendar
          localizer={localizer} /* 2. ADD THE LOCALIZER PROP HERE */
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
        />
      </div>

      {showModal && (
        <div className="mm-popup">
          <div className="mm-popup__box">
            <h2 className="mm-popup__box__title">
              {modalType === "create" ? "Create Event" : "Edit Event"}
            </h2>
            <div className="mm-popup__box__body">
              <input
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="popup-input"
              />
              <input
                type="text"
                placeholder="Event Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="popup-input"
              />
            </div>
            
            <div className="mm-popup__box__footer">
              {modalType === "edit" && (
                <div className="mm-popup__box__footer__left-space">
                  <button className="mm-popup__btn mm-popup__btn--info" onClick={handleSave}>
                    Update
                  </button>
                  <button className="mm-popup__btn mm-popup__btn--danger" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              )}
              
              <div className="mm-popup__box__footer__right-space">
                <button className="mm-popup__btn" onClick={handleSave}>
                  Save
                </button>
                <button className="mm-popup__btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}