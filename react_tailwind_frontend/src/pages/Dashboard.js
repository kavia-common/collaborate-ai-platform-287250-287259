import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PROJECTS, PROJECT_CREATED, PROJECT_UPDATED, PROJECT_DELETED } from '../graphql/projectOperations';
import { GET_EVENTS, EVENT_CREATED, EVENT_UPDATED, EVENT_DELETED } from '../graphql/eventOperations';
import { ME_QUERY } from '../graphql/authOperations';
import KPICard from '../components/dashboard/KPICard';
import ProjectsByStatusChart from '../components/dashboard/ProjectsByStatusChart';
import EventsOverTimeChart from '../components/dashboard/EventsOverTimeChart';
import DashboardTable from '../components/dashboard/DashboardTable';

const Dashboard = () => {
  // 1. Fetch Data
  const { data: meData } = useQuery(ME_QUERY);
  
  const { 
    data: projectsData, 
    loading: projectsLoading, 
    subscribeToMore: subscribeToProjects 
  } = useQuery(GET_PROJECTS);

  const { 
    data: eventsData, 
    loading: eventsLoading, 
    subscribeToMore: subscribeToEvents 
  } = useQuery(GET_EVENTS);

  // 2. Real-time Subscriptions
  useEffect(() => {
    // Project Subscriptions
    const unsubProjectCreated = subscribeToProjects({
      document: PROJECT_CREATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newProject = subscriptionData.data.projectCreated;
        // Check duplication
        if (prev.getProjects.find(p => p.id === newProject.id)) return prev;
        return Object.assign({}, prev, {
          getProjects: [...prev.getProjects, newProject]
        });
      }
    });

    const unsubProjectUpdated = subscribeToProjects({
      document: PROJECT_UPDATED,
      updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          const updatedProject = subscriptionData.data.projectUpdated;
          return Object.assign({}, prev, {
              getProjects: prev.getProjects.map(p => 
                  p.id === updatedProject.id ? updatedProject : p
              )
          });
      }
    });

    const unsubProjectDeleted = subscribeToProjects({
      document: PROJECT_DELETED,
      updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          const deletedId = subscriptionData.data.projectDeleted;
          return Object.assign({}, prev, {
              getProjects: prev.getProjects.filter(p => p.id !== deletedId)
          });
      }
    });

    return () => {
        // Cleanup handled by Apollo mostly, but good practice to be aware
    };
  }, [subscribeToProjects]);

  useEffect(() => {
      // Event Subscriptions
      const unsubEventCreated = subscribeToEvents({
        document: EVENT_CREATED,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          const newEvent = subscriptionData.data.eventCreated;
          if (prev.getEvents.find(e => e.id === newEvent.id)) return prev;
          return Object.assign({}, prev, {
            getEvents: [...prev.getEvents, newEvent]
          });
        }
      });

      const unsubEventUpdated = subscribeToEvents({
        document: EVENT_UPDATED,
        updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) return prev;
            const updatedEvent = subscriptionData.data.eventUpdated;
            return Object.assign({}, prev, {
                getEvents: prev.getEvents.map(e => 
                    e.id === updatedEvent.id ? updatedEvent : e
                )
            });
        }
      });

      const unsubEventDeleted = subscribeToEvents({
        document: EVENT_DELETED,
        updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) return prev;
            const deletedId = subscriptionData.data.eventDeleted;
            return Object.assign({}, prev, {
                getEvents: prev.getEvents.filter(e => e.id !== deletedId)
            });
        }
      });
  }, [subscribeToEvents]);


  // 3. Calculate Stats
  const projects = projectsData?.getProjects || [];
  const events = eventsData?.getEvents || [];

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => 
      p.status?.toLowerCase() === 'active' || p.status?.toLowerCase() === 'in_progress'
  ).length;
  
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.startTime) > new Date()).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 mt-1">
             Welcome back, <span className="font-semibold text-primary">{meData?.me?.username || 'User'}</span>! 
             Here's what's happening today.
          </p>
        </div>
        <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
            title="Total Projects" 
            value={totalProjects} 
            loading={projectsLoading}
            icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            }
            color="blue"
        />
        <KPICard 
            title="Active Projects" 
            value={activeProjects} 
            loading={projectsLoading}
            icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            }
            color="amber"
        />
        <KPICard 
            title="Total Events" 
            value={totalEvents} 
            loading={eventsLoading}
            icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            }
            color="purple"
        />
        <KPICard 
            title="Upcoming Events" 
            value={upcomingEvents} 
            loading={eventsLoading}
            icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
            color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <EventsOverTimeChart events={events} loading={eventsLoading} />
         <ProjectsByStatusChart projects={projects} loading={projectsLoading} />
      </div>

      {/* Unified Table */}
      <div className="w-full">
         <DashboardTable projects={projects} events={events} loading={projectsLoading || eventsLoading} />
      </div>

    </div>
  );
};

export default Dashboard;
