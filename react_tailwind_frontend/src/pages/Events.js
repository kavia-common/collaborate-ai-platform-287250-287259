import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
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

  if (loading) return <div className="p-8">Loading events...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading events: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
       <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
        <div className="p-6 border-b">
           <Link to="/dashboard" className="text-xl font-bold text-blue-600">Collaborate AI</Link>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Dashboard</Link>
          <Link to="/projects" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Projects</Link>
          <Link to="/events" className="block px-4 py-2 rounded bg-blue-50 text-blue-700 font-medium">Events</Link>
          <Link to="/messages" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Messages</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Events</h1>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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
              <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">{event.type}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{new Date(parseInt(event.date)).toLocaleString()} • {event.location || 'Online'}</p>
                  <p className="text-gray-600">{event.description}</p>
                </div>
                <button 
                  onClick={() => handleDelete(event.id)}
                  className="text-red-500 hover:text-red-700 ml-4 p-2"
                  title="Delete Event"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-10">No upcoming events.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Events;
