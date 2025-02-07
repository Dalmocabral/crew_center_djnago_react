import {Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';


function App() {
  return (  
    <>  
      <Navbar 
      content = {
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app/dashboard" element={<Dashboard />} />        
      </Routes>

      }/> 
      
    </>   
  );
}

export default App;
