import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Trophy, Flame, Target, Calendar } from 'lucide-react';
import api from '../../utils/api';

const SessionTracker = () => {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [streak, setStreak] = useState(null);
  const [todayStats, setTodayStats] = useState({
    totalTime: 0,
    sessions: 0,
    problems: 0
  });
  const [activityDetails, setActivityDetails] = useState({
    problemsSolved: 0,
    topicsStudied: '',
    notes: ''
  });

  useEffect(() => {
    fetchResources();
    checkActiveSession();
    fetchStreak();
    fetchTodayStats();
  }, []);

  useEffect(() => {
    let interval;
    if (activeSession) {
      interval = setInterval(() => {
        const start = new Date(activeSession.startTime);
        const now = new Date();
        const diff = Math.floor((now - start) / 1000);
        setElapsedTime(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchResources = async () => {
    try {
      const res = await api.get('/resources');
      setResources(res.data.resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const checkActiveSession = async () => {
    try {
      const res = await api.get('/sessions/active');
      if (res.data.session) {
        setActiveSession(res.data.session);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const fetchStreak = async () => {
    try {
      const res = await api.get('/streaks');
      setStreak(res.data.streak);
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const res = await api.get('/sessions/analytics?period=today');
      setTodayStats({
        totalTime: res.data.totalTime || 0,
        sessions: res.data.totalSessions || 0,
        problems: res.data.totalProblems || 0
      });
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
  };

  const startSession = async () => {
    if (!selectedResource) {
      alert('Please select a resource');
      return;
    }

    try {
      const res = await api.post('/sessions/start', { resourceId: selectedResource });
      setActiveSession(res.data.session);
      setElapsedTime(0);
    } catch (error) {
      alert(error.response?.data?.message || 'Error starting session');
    }
  };

  const endSession = async () => {
    setShowActivityForm(true);
  };

  const submitActivityDetails = async () => {
    try {
      const topics = activityDetails.topicsStudied
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      await api.put('/sessions/end', {
        sessionId: activeSession._id,
        activityDetails: {
          ...activityDetails,
          topicsStudied: topics
        }
      });

      setActiveSession(null);
      setShowActivityForm(false);
      setActivityDetails({
        problemsSolved: 0,
        topicsStudied: '',
        notes: ''
      });
      setElapsedTime(0);
      
      // Refresh data
      fetchStreak();
      fetchTodayStats();
      
      alert('Session ended successfully! 🎉');
    } catch (error) {
      alert('Error ending session');
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const getStreakMessage = () => {
    const current = streak?.currentStreak || 0;
    if (current === 0) return "Start your streak today! 🌱";
    if (current === 1) return "Great start! Keep going! 💪";
    if (current < 7) return "Building momentum! 🔥";
    if (current < 30) return "Incredible consistency! 🚀";
    return "You're a legend! 👑";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Today's Stats */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Session Tracker</h2>
        
        {/* Today's Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Today's Time</p>
                <p className="text-2xl font-bold mt-1">{formatMinutes(todayStats.totalTime)}</p>
              </div>
              <Clock size={32} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Problems Solved</p>
                <p className="text-2xl font-bold mt-1">{todayStats.problems}</p>
              </div>
              <Target size={32} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Sessions Today</p>
                <p className="text-2xl font-bold mt-1">{todayStats.sessions}</p>
              </div>
              <Calendar size={32} className="opacity-80" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Session Tracker */}
        <div className="lg:col-span-2">
          {!activeSession ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Start New Session</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Select Learning Resource
                </label>
                <select
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="" className="text-gray-500 dark:text-gray-400">Choose a resource...</option>
                  {resources.map((resource) => (
                    <option key={resource._id} value={resource._id} className="text-gray-900 dark:text-white">
                      {resource.icon} {resource.name} ({resource.category})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={startSession}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition shadow-lg"
              >
                <Play size={24} />
                <span className="text-lg">Start Session</span>
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Session Active</span>
                </div>
                
                <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {activeSession.resourceId?.icon} {activeSession.resourceId?.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeSession.resourceId?.category}
                </p>
              </div>

              {/* Timer Display */}
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-900 rounded-xl p-8 mb-6 border-2 border-teal-200 dark:border-teal-800">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Clock size={32} className="text-teal-600 dark:text-teal-400" />
                  <span className="text-6xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                    {formatTime(elapsedTime)}
                  </span>
                </div>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Keep up the great work! 💪
                </p>
              </div>

              {!showActivityForm ? (
                <button
                  onClick={endSession}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition shadow-lg"
                >
                  <Square size={24} />
                  <span className="text-lg">End Session</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Session Summary</h4>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Problems Solved Today
                    </label>
                    <input
                      type="number"
                      value={activityDetails.problemsSolved}
                      onChange={(e) => setActivityDetails({
                        ...activityDetails,
                        problemsSolved: parseInt(e.target.value) 
                      })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Topics Studied (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={activityDetails.topicsStudied}
                      onChange={(e) => setActivityDetails({
                        ...activityDetails,
                        topicsStudied: e.target.value
                      })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Arrays, Linked Lists, Trees"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Notes (optional)
                    </label>
                    <textarea
                      value={activityDetails.notes}
                      onChange={(e) => setActivityDetails({
                        ...activityDetails,
                        notes: e.target.value
                      })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows="3"
                      placeholder="Key learnings, challenges faced, etc."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={submitActivityDetails}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      Complete Session
                    </button>
                    <button
                      onClick={() => setShowActivityForm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Streak & Stats Sidebar */}
        <div className="space-y-6">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Streak</h3>
              <Flame size={28} />
            </div>
            
            <div className="text-center mb-4">
              <div className="text-6xl font-bold mb-2">
                {streak?.currentStreak || 0}
              </div>
              <p className="text-orange-100 text-sm">Days in a row! 🔥</p>
            </div>

            <div className="space-y-2 bg-white/10 rounded-lg p-3 backdrop-blur">
              <div className="flex justify-between text-sm">
                <span className="text-orange-100">Longest Streak:</span>
                <span className="font-bold">{streak?.longestStreak || 0} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-100">Total Active Days:</span>
                <span className="font-bold">{streak?.totalSessionDays || 0} days</span>
              </div>
            </div>

            <p className="text-center mt-4 text-sm text-orange-100">
              {getStreakMessage()}
            </p>
          </div>

          {/* Motivation Card - WOW FACTOR! */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={24} />
              <h3 className="text-lg font-semibold">Achievement Zone</h3>
            </div>
            <h3>To acheive this zone, The goal should be 7 days</h3>

            <div className="space-y-3">
              {streak?.currentStreak >= 7 && (
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="font-semibold text-sm">🏆 Week Warrior</p>
                  <p className="text-xs text-purple-100 mt-1">7 day streak achieved!</p>
                </div>
              )}

              {todayStats.problems >= 5 && (
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="font-semibold text-sm">🎯 Problem Crusher</p>
                  <p className="text-xs text-purple-100 mt-1">5+ problems today!</p>
                </div>
              )}

              {todayStats.totalTime >= 120 && (
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="font-semibold text-sm">⏰ Time Master</p>
                  <p className="text-xs text-purple-100 mt-1">2+ hours of focus!</p>
                </div>
              )}

              {streak?.currentStreak === 0 && todayStats.sessions === 0 && (
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur text-center">
                  <p className="text-sm">🌟 Start your journey today!</p>
                  <p className="text-xs text-purple-100 mt-2">
                    Every expert was once a beginner
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                <span>Take 5-min breaks every hour</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                <span>Track topics to identify patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                <span>Aim for consistent daily practice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                <span>Quality over quantity always wins</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTracker;