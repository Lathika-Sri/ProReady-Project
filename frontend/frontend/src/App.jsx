import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/Layout/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AIToolsHub from './pages/AIToolsHub';

// Components
import Dashboard from './components/Dashboard/Dashboard';
import SessionTracker from './components/Session/SessionTracker';
import ResumeGenerator from './components/AI/ResumeGenerator';
import NotesSummarizer from './components/AI/NotesSummarizer';
import RoadmapGenerator from './components/AI/RoadmapGenerator';
import ResourceManagement from './components/Resources/ResourceManagement';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App Content
const AppContent = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session"
          element={
            <ProtectedRoute>
              <SessionTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <ResourceManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <AIToolsHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/resume"
          element={
            <ProtectedRoute>
              <ResumeGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/notes"
          element={
            <ProtectedRoute>
              <NotesSummarizer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/roadmap"
          element={
            <ProtectedRoute>
              <RoadmapGenerator />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

// Main App with AuthProvider
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;