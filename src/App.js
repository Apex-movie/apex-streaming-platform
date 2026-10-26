
import React from 'react';
import './App.css';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Help from './pages/Help/Help';

import Dashboard from './pages/Admin/Dashboard';
import AddMovie from './pages/Admin/AddMovie/AddMovie';
import EditMovie from './pages/Admin/EditMovie/EditMovie';
import AdminAIChat from './components/AdminAIChat/AdminAIChat';
import MovieDetails from './pages/MovieDetails/MovieDetails';
import WatchMovie from './WatchMovie/WatchMovie';
import Subscription from './pages/Subscription/Subscription';
import WatchHistory from './pages/WatchHistory/WatchHistory';
import Favorites from './pages/Favorites/Favorites';

import Messages from './pages/Messages/Messages';
import AdminMessages from './pages/Admin/AdminMessages/AdminMessages';

import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

// ADMIN PROTECTED ROUTE
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// MAIN APP
const App = () => {
  return (
    <div>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/help" element={<Help />} />

        {/* SUBSCRIPTION */}
        <Route
          path="/subscription"
          element={<Subscription />}
        />

        {/* ADMIN AI CHAT */}
        <Route
          path="/admin-ai"
          element={<AdminAIChat />}
        />

        {/* MOVIE DETAILS */}
        <Route
          path="/movie/:id"
          element={<MovieDetails />}
        />

        {/* WATCH MOVIE */}
        <Route
          path="/watch/:id"
          element={<WatchMovie />}
        />

        {/* WATCH HISTORY */}
        <Route
          path="/history"
          element={<WatchHistory />}
        />

        {/* FAVORITES */}
        <Route
          path="/favorites"
          element={<Favorites />}
        />

        {/* USER SUPPORT MESSAGES */}
        <Route
          path="/messages"
          element={<Messages />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />

        {/* ADMIN SUPPORT INBOX */}
        <Route
          path="/admin/messages"
          element={
            <AdminRoute>
              <AdminMessages />
            </AdminRoute>
          }
        />

        {/* ADD MOVIE */}
        <Route
          path="/admin/add-movie"
          element={
            <AdminRoute>
              <AddMovie />
            </AdminRoute>
          }
        />

        {/* EDIT MOVIE */}
        <Route
          path="/admin/edit-movie/:id"
          element={
            <AdminRoute>
              <EditMovie />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;