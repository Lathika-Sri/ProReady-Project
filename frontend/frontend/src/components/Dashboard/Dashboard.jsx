import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Target, TrendingUp, Award, Calendar, Flame } from 'lucide-react';
import api from '../../utils/api';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [streak, setStreak] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, streakRes] = await Promise.all([
        api.get(`/sessions/analytics?period=${period}`),
        api.get('/streaks')
      ]);

      setAnalytics(analyticsRes.data);
      setStreak(streakRes.data.streak);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300">Loading your stats...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const resourceChartData = Object.entries(analytics?.resourceStats || {}).map(([name, data]) => ({
    name,
    time: data.time,
    sessions: data.sessions
  }));

  const dailyChartData = Object.entries(analytics?.dailyStats || {}).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time: data.time,
    problems: data.problems
  }));

  const COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#10b981'];

  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your preparation progress</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-lg transform hover:scale-105 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Total Time</p>
              <p className="text-3xl font-bold mt-2">
                {formatMinutes(analytics?.totalTime || 0)}
              </p>
              <p className="text-teal-100 text-xs mt-1">
                Avg: {formatMinutes(Math.floor((analytics?.totalTime || 0) / (analytics?.totalSessions || 1)))} per session
              </p>
            </div>
            <Clock size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg transform hover:scale-105 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Problems Solved</p>
              <p className="text-3xl font-bold mt-2">{analytics?.totalProblems || 0}</p>
              <p className="text-purple-100 text-xs mt-1">
                {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
              </p>
            </div>
            <Target size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg transform hover:scale-105 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Sessions</p>
              <p className="text-3xl font-bold mt-2">{analytics?.totalSessions || 0}</p>
              <p className="text-orange-100 text-xs mt-1">
                Keep the momentum going! 🚀
              </p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white shadow-lg transform hover:scale-105 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Current Streak</p>
              <p className="text-3xl font-bold mt-2 flex items-center gap-2">
                {streak?.currentStreak || 0}
                <Flame size={28} className="text-yellow-300" />
              </p>
              <p className="text-pink-100 text-xs mt-1">
                Best: {streak?.longestStreak || 0} days
              </p>
            </div>
            <Award size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar size={24} className="text-teal-500" />
            Daily Progress
          </h3>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#14b8a6" 
                  strokeWidth={3}
                  name="Time (mins)" 
                  dot={{ fill: '#14b8a6', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="problems" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Problems" 
                  dot={{ fill: '#8b5cf6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No data yet. Start a session to see your progress! 📊</p>
            </div>
          )}
        </div>

        {/* Resource Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Target size={24} className="text-purple-500" />
            Time by Resource
          </h3>
          {resourceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="time"
                >
                  {resourceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No resource data yet. Start tracking! 🎯</p>
            </div>
          )}
        </div>
      </div>

      {/* Resource Comparison Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={24} className="text-orange-500" />
          Resource Comparison
        </h3>
        {resourceChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resourceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Bar dataKey="time" fill="#14b8a6" name="Time (mins)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="sessions" fill="#8b5cf6" name="Sessions" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>Start using different resources to see comparison! 📈</p>
          </div>
        )}
      </div>

      {/* Streak Info Banner */}
      <div className="bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 text-white rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🔥 Your Consistency Streak
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
            <p className="text-sm opacity-90 mb-1">Current Streak</p>
            <p className="text-4xl font-bold">{streak?.currentStreak || 0}</p>
            <p className="text-xs opacity-75 mt-1">consecutive days</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
            <p className="text-sm opacity-90 mb-1">Longest Streak</p>
            <p className="text-4xl font-bold">{streak?.longestStreak || 0}</p>
            <p className="text-xs opacity-75 mt-1">days (personal best)</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
            <p className="text-sm opacity-90 mb-1">Total Active Days</p>
            <p className="text-4xl font-bold">{streak?.totalSessionDays || 0}</p>
            <p className="text-xs opacity-75 mt-1">days of practice</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-xl font-semibold">
            {streak?.currentStreak >= 30 
              ? "🏆 You're unstoppable! Legendary consistency!"
              : streak?.currentStreak >= 14
              ? "🚀 Two weeks strong! You're on fire!"
              : streak?.currentStreak >= 7
              ? "💪 One week streak! Amazing dedication!"
              : streak?.currentStreak >= 3
              ? "🌟 Great start! Keep building that habit!"
              : "🌱 Begin your journey today! Every day counts!"}
          </p>
        </div>
      </div>

      {/* Insights Section */}
      {analytics?.totalSessions > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
              💡 Quick Insight
            </h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              You're averaging <strong>{formatMinutes(Math.floor((analytics?.totalTime || 0) / (analytics?.totalSessions || 1)))}</strong> per session. 
              {(analytics?.totalTime || 0) / (analytics?.totalSessions || 1) < 30 
                ? " Try to aim for 30+ minutes for deeper focus!"
                : " Great focus time! Keep it up! 🎯"}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
              🎯 Goal Tracker
            </h4>
            <p className="text-purple-800 dark:text-purple-300 text-sm">
              {analytics?.totalProblems >= 10 
                ? "🏆 10+ problems! You're crushing it!"
                : analytics?.totalProblems >= 5
                ? "💪 5+ problems! Halfway to 10!"
                : "🌟 Start solving problems to build momentum!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;