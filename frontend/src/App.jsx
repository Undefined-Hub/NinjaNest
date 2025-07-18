import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from "./components/PrivateRoute";
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ExplorePage from './pages/ExplorePage'
import './App.css'
import Dashboard from './pages/Dashboard';
import DetailsPage from './pages/DetailsPage';
import AddProperty from './pages/AddProperty';
import CurrentPropertyDashboard from './pages/CurrentPropertyDashboard';
import { Toaster } from 'react-hot-toast';
import EditProperty from './pages/EditProperty';
import InvitationSuccessPage from './pages/InvitationSuccessPage';
import InvitationDeclinedPage from './pages/InvitationDeclinedPage';
import LandlordPropertyDashboard from './pages/LandlordPropertyDashboard';
function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/explore/property/:propertyId" element={
            <PrivateRoute>
              <DetailsPage />
            </PrivateRoute>
          } />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/add-property" element={<PrivateRoute><AddProperty /></PrivateRoute>} />
          <Route path="/edit-property/:propertyId" element={<PrivateRoute><EditProperty /></PrivateRoute>} />
          <Route path="/property-stats/:propertyId" element={<PrivateRoute><LandlordPropertyDashboard /></PrivateRoute>} />
          <Route path="/currentpropertydashboard/:propertyId" element={<PrivateRoute><CurrentPropertyDashboard /></PrivateRoute>} />
          <Route path="/invitation-success/:invitationId" element={<InvitationSuccessPage />} />
          <Route path="/invitation-declined/:invitationId" element={<InvitationDeclinedPage />} />
        </Routes>
        <Footer />
      </Router>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  )
}

export default App
