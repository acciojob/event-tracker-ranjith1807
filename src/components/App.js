import React, { useState } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/App.css';

// Fix for v0.20.1: Initialize localizer via the default import
const localizer = BigCalendar.momentLocalizer(moment);

const App = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All');
  
  // Unified popup state to prevent desyncs
  const [popup, setPopup] = useState({ isOpen: false, type: '', eventId: null });
  const [formData, setFormData] = useState({ title: '', location: '', start: new Date() });

  // Open creation popup on date click
  const handleSelectSlot = ({ start }) => {
    setFormData({ title: '', location: '', start });
    setPopup({ isOpen: true, type: 'create', eventId: null });
  };

  // Open edit/delete popup on event click
  const handleSelectEvent = (event) => {
    setFormData({ title: event.title, location: event.location, start: event.start });
    setPopup({ isOpen: true, type: 'edit', eventId: event.id });
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (popup.type === 'create') {
      const newEvent = {
        id: Date.now().toString(),
        title: formData.title,
        location: formData.location,
        start: formData.start,
        end: moment(formData.start).add(1, 'hour').toDate(),
      };
      setEvents([...events, newEvent]);
    } else if (popup.type === 'edit') {
      setEvents(events.map(evt => 
        evt.id === popup.eventId 
          ? { ...evt, title: formData.title, location: formData.location } 
          : evt
      ));
    }
    closePopup();
  };

  const handleDelete = () => {
    setEvents(events.filter(evt => evt.id !== popup.eventId));
    closePopup();
  };

  const closePopup = () => {
    setPopup({ isOpen: false, type: '', eventId: null });
    setFormData({ title: '', location: '', start: new Date() });
  };

  // Filter categorization
  const filteredEvents = events.filter(evt => {
    const isPast = moment(evt.start).isBefore(new Date(), 'minute');
    if (filter === 'Past') return isPast;
    if (filter === 'Upcoming') return !isPast;
    return true;
  });

  // Dynamic styling for Past (Pink) vs Upcoming (Green)
  const eventPropGetter = (event) => {
    const isPast = moment(event.start).isBefore(new Date(), 'minute');
    return {
      style: {
        backgroundColor: isPast ? 'rgb(222, 105, 135)' : 'rgb(140, 189, 76)',
        color: 'white',
        border: 'none'
      }
    };
  };

  return (
    <div className="App">
      <ul className="filter-buttons">
        <li>
          <button className="btn" onClick={() => setFilter('All')}>All</button>
        </li>
        <li>
          <button className="btn" onClick={() => setFilter('Past')}>Past</button>
        </li>
        <li>
          <button 
            className="btn" 
            style={{ backgroundColor: 'rgb(140, 189, 76)', color: '#fff' }} 
            onClick={() => setFilter('Upcoming')}
          >
            Upcoming
          </button>
        </li>
        <li>
          <button 
            className="btn" 
            style={{ backgroundColor: 'rgb(222, 105, 135)', color: '#fff' }} 
            onClick={() => {
              setFormData({ title: '', location: '', start: new Date() });
              setPopup({ isOpen: true, type: 'create', eventId: null });
            }}
          >
            Add Event
          </button>
        </li>
      </ul>

      <BigCalendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
      />

      {/* Reusable Modal Implementation */}
      {popup.isOpen && (
        <>
          <div className="mm-popup-overlay" onClick={closePopup}></div>
          <div className="mm-popup__box">
            <div className="mm-popup__box__header">
              {popup.type === 'create' ? 'Create Event' : 'Edit Event'}
            </div>

            <div className="mm-popup__box__body">
              <input
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <input
                placeholder="Event Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="mm-popup__box__footer">
              <div className="mm-popup__box__footer__right-space">
                {popup.type === 'edit' ? (
                  <>
                    <button className="mm-popup__btn mm-popup__btn--info" onClick={handleSave}>
                      Save
                    </button>
                    <button className="mm-popup__btn mm-popup__btn--danger" onClick={handleDelete}>
                      Delete
                    </button>
                  </>
                ) : (
                  <button className="mm-popup__btn" onClick={handleSave}>
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;