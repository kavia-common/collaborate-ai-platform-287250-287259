import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENTS, CREATE_EVENT, UPDATE_EVENT, DELETE_EVENT } from '../graphql/eventOperations';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery(GET_EVENTS, {
    notifyOnNetworkStatusChange: true,
  });

  const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT, {
    onCompleted: () => {
      refetch();
      closeModal();
      showToast('Event scheduled successfully!', 'success');
    },
    onError: (err) => showToast(err.message || 'Failed to schedule event', 'error')
  });

  const [updateEvent, { loading: updating }] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      refetch();
      closeModal();
      showToast('Event updated successfully!', 'success');
    },
    onError: (err) => showToast(err.message || 'Failed to update event', 'error')
  });

  const [deleteEvent] = useMutation(DELETE_EVENT, {
    onCompleted: () => {
      refetch();
      showToast('Event cancelled successfully', 'success');
    },
    onError: (err) => showToast(err.message || 'Failed to cancel event', 'error')
  });

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    isVirtual: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Helper: Convert Date to datetime-local string (YYYY-MM-DDThh:mm)
  const toLocalISOString = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    
    const pad = (n) => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openCreateModal = () => {
    setCurrentEvent(null);
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      isVirtual: false
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startTime: toLocalISOString(event.startTime),
      endTime: toLocalISOString(event.endTime),
      location: event.location || '',
      isVirtual: event.isVirtual || false
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEvent(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Event title is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';
    
    if (formData.startTime && formData.endTime) {
      if (new Date(formData.endTime) <= new Date(formData.startTime)) {
        errors.endTime = 'End time must be after start time';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Convert local datetime inputs to ISO strings for backend
    const inputData = {
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      location: formData.location,
      isVirtual: formData.isVirtual
    };

    if (currentEvent) {
      updateEvent({
        variables: {
          input: {
            id: currentEvent.id,
            ...inputData
          }
        }
      });
    } else {
      createEvent({
        variables: {
          input: inputData
        }
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      deleteEvent({ variables: { id } });
    }
  };

  const formatEventTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded shadow-lg border-l-4 transition-all duration-300 transform translate-y-0 ${
          toast.type === 'error' ? 'bg-white border-red-500 text-red-700' : 'bg-white border-green-500 text-green-700'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Events</h1>
          <p className="text-text-secondary text-sm">Schedule and manage company events</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition shadow-sm hover:shadow-md flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Schedule Event
        </button>
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center gap-3">
           <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <div>
             <h3 className="font-bold">Error loading events</h3>
             <p className="text-sm">{error.message}</p>
             <button onClick={() => refetch()} className="text-red-700 underline text-sm mt-1 hover:text-red-900">Try Again</button>
           </div>
        </div>
      )}

      {/* Events Grid */}
      {!loading && !error && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {data?.getEvents?.length > 0 ? (
            // Sort events by start time
            [...data.getEvents]
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .map(event => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col h-full group">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                       <span className="text-3xl font-bold text-primary leading-none">
                         {new Date(event.startTime).getDate()}
                       </span>
                       <span className="text-sm font-medium text-text-secondary uppercase">
                         {new Date(event.startTime).toLocaleDateString(undefined, { month: 'short' })}
                       </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(event)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Event"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel Event"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={event.title}>{event.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                     <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>
                          {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                        </span>
                     </div>
                     <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>
                          {event.isVirtual ? 'Virtual / Online' : (event.location || 'No location specified')}
                        </span>
                     </div>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 h-10">
                    {event.description || 'No description provided.'}
                  </p>
                </div>
                
                {event.isVirtual && (
                   <div className="px-6 py-3 bg-blue-50/50 border-t border-blue-100 rounded-b-xl flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      <span className="text-xs font-medium text-blue-700">Virtual Event</span>
                   </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
                <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No events scheduled</h3>
                <p className="mt-1 text-gray-500 max-w-sm mx-auto mb-6">Create your first event to share with your team.</p>
                <button 
                  onClick={openCreateModal}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Schedule Event
                </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={closeModal}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg pointer-events-auto transform transition-all animate-fade-in-up">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                <h3 className="text-xl font-bold text-gray-900">
                  {currentEvent ? 'Edit Event' : 'Schedule New Event'}
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${formErrors.title ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="e.g. Weekly Standup"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${formErrors.startTime ? 'border-red-500' : 'border-gray-200'}`}
                      value={formData.startTime}
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                    />
                     {formErrors.startTime && <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${formErrors.endTime ? 'border-red-500' : 'border-gray-200'}`}
                      value={formData.endTime}
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                    />
                     {formErrors.endTime && <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>}
                  </div>
                </div>

                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="checkbox" 
                        id="isVirtual"
                        checked={formData.isVirtual}
                        onChange={e => setFormData({...formData, isVirtual: e.target.checked})}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isVirtual" className="text-sm font-medium text-gray-700 select-none">This is a virtual event</label>
                   </div>
                   
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.isVirtual ? 'Meeting Link / Details' : 'Location'}
                   </label>
                   <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={formData.isVirtual ? "e.g. https://zoom.us/j/..." : "e.g. Conference Room A"}
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24"
                    placeholder="Event agenda and details..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={creating || updating}
                    className="flex-1 px-4 py-2 text-white bg-primary hover:bg-primary-700 rounded-lg font-medium shadow-md shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {(creating || updating) && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    {currentEvent ? 'Update Event' : 'Schedule Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Events;
