import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import Login from './components/Login';
import Signup from './components/Signup';
import HeroFinder from './components/HeroFinder'; 
import UnauthUsers from './components/UnauthUsers'; 
import UpdatePassword from './components/updatepassword';
import AdminPage from './components/AdminPage';
import DisabledPage from './components/DisabledPage';
import PrivacyPolicy from './components/PrivacyPolicy';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/signin" element={<Login />} />
        <Route path = "/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/updatepassword" element={<UpdatePassword />} />
        <Route path = "/AdminPage" element={<AdminPage />} />
        <Route path = "/DisabledPage" element={<DisabledPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path = "/unauthusers" element={<UnauthUsers />} />
        <Route path="/herofinder" element={<HeroFinder />} />
      </Routes>
    </Router>
  );
}

export default App;