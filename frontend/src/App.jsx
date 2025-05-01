import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Properties from './pages/Properties'
import './App.css'
import ProfilePage from './pages/ProfilePage';
import DetailsPage from './pages/DetailsPage';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/details/:propertyId" element={<DetailsPage />} />
          <Route path="/properties" element={<Properties />} />
        </Routes>
        <Footer />
      </Router>
    </>
  )
}

export default App
