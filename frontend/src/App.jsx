import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Explore from './pages/Explore'
import './App.css'
import Dashboard from './pages/Dashboard';
import DetailsPage from './pages/DetailsPage';
import AddProperty from './pages/AddProperty';
function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore/property/:propertyId" element={<DetailsPage />} />
          <Route path="/explore" element={<Explore/>} />
          <Route path="/add-property" element={<AddProperty />} />
        </Routes>
        <Footer />
      </Router>
    </>
  )
}

export default App
