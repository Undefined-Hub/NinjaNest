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
function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={   <PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/explore/property/:propertyId" element={
               <PrivateRoute>
                 <DetailsPage />
               </PrivateRoute>
           } />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/edit-property/:propertyId" element={<EditProperty />} />
          <Route path="/currentpropertydashboard/:propertyId" element={<CurrentPropertyDashboard />} />
        </Routes>
        <Footer />
      </Router>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  )
}

export default App
