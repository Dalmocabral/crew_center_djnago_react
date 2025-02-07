import {Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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
