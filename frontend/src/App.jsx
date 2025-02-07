import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import Home from './pages/Home';
import MyAwards from './pages/MyAwards';
import MyFlights from './pages/MyFlights';
import Awards from './pages/Awards';
import Map from './pages/Map';
import Navbar from './components/Navbar';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<Navbar />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="awards" element={<Awards />} />
        <Route path="my-flights" element={<MyFlights />} />
        <Route path="my-awards" element={<MyAwards />} />
        <Route path="map" element={<Map />} />
      </Route>
    </Routes>
  );
}

export default App;
