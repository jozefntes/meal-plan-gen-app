import React from 'react';
import { Routes, Route } from "react-router-dom";
import SignUp from './components/SignUp';
import SignIn from "./components/SignIn"; 
import './components/SignUp.css';

const App = () => {
  return (
      <div>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
      </Routes>
      </div>
  
    
  );
};

export default App;
