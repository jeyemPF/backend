import Home from '../src/pages/Home';
import About from '../src/pages/About';
import Services from '../src/pages/Services';
import Contact from '../src/pages/Contact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Make sure to import BrowserRouter
import Authenticate from '../src/auth/Authenticate';
import Login from '../src/auth/Login';
import AuthenticateSuccess from '../src/auth/AuthenticateSuccess';

function App() {
  return (
  <div>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/authenticate" element={<Authenticate />} />
        <Route path="/authenticatesuccess" element={<AuthenticateSuccess />} />
   
      </Routes>
    </Router> 
  </div>
  
  );
}

export default App;