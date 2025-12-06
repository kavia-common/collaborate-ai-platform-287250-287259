import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENTS, CREATE_EVENT, DELETE_EVENT } from '../graphql/eventOperations';

const Events = () => {
  const { data, loading, error, refetch } = useQuery(GET_EVENTS);
  const [createEvent] = useMutation(CREATE_EVENT, { onCompleted: refetch });
  const [deleteEvent] = useMutation(DELETE_EVENT, { onCompleted: refetch });

  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', type: 'MEETING' });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    createEvent({ variables: newEvent });
    setNewEvent({ title: '', description: '', date: '', location: '', type: 'MEETING' });
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent({ variables: { id } });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">Error loading events: {error.message}</div>;

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Events</h1>
            <p className="text-text-secondary text-sm">Schedule and manage company events</p>
          </div>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition shadow-sm hover:shadow-md flex items-center gap-2"
          >
            {isFormOpen ? 'Close Form' : 'New Event'}
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Schedule New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Event Title"
                  className="w-full border p-2 rounded"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  required
                />
                <input
                  type="datetime-local"
                  className="w-full border p-2 rounded"
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Location"
                className="w-full border p-2 rounded"
                value={newEvent.location}
                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
              />
              <textarea
                placeholder="Description"
                className="w-full border p-2 rounded"
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
              />
              <select
                className="w-full border p-2 rounded"
                value={newEvent.type}
                onChange={e => setNewEvent({...newEvent, type: e.target.value})}
              >
                <option value="MEETING">Meeting</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="DEADLINE">Deadline</option>
                <option value="SOCIAL">Social</option>
              </select>
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Create Event</button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {data.events && data.events.length > 0 ? (
            data.events.map(event => (
              <div key={event.id} className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-text">{event.title}</h3>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-secondary/10 text-secondary tracking-wide uppercase">{event.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(parseInt(event.date)).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(parseInt(event.date)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {event.location || 'Online'}
                    </span>
                  </div>
                  <p className="text-text-secondary">{event.description}</p>
                </div>
                <button 
                  onClick={() => handleDelete(event.id)}
                  className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Event"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
             <div className="py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-text">No events</h3>
                <p className="mt-1 text-sm text-text-secondary">Get started by scheduling a new event.</p>
            </div>
          )}
        </div>
    </>
  );
};

export default Events;
