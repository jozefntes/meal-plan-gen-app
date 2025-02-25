import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './SignUp.css'

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const passwordVisibility = () => {
    setShowPassword((prev) => !prev);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate("/home");

    
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log("Google Sign-In Success", credentialResponse);
    navigate("/home");
  };

  const handleGoogleFailure = () => {
    console.log("Google Sign-In Failed")
  };

  return (
    <div className="container">
      <div className="photo-section">
        <img src="signupimg.jpeg" alt="Meal Prep Photo" />
      </div>
      <div className="form-section">
        <header>Meal Plan</header>
        <h2>Sign Up to Meal Plan Generator</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label><br/>
            <input type="email" id="email" value={email} placeholder="Email or Phone Number"onChange={handleEmailChange} required />
          </div>
          <div className="password-container">
            <label htmlFor="password">Password</label><br/>
            <input type={showPassword ? "text" : "password"} id="password" placeholder="Enter Password" value={password} onChange={handlePasswordChange} required />
            <img 
              src={showPassword ? "/noShowPassword.svg" : "/showPassword.svg"} 
              alt="Toggle Password Visibility" 
              className="toggle-password-button" 
              onClick={passwordVisibility} 
            />
          </div>
          <button type="submit">Create Account</button>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
        </form>
        <p className="link">
            Already have an account? <Link to='/signin'>Sign in</Link>

        </p>
      </div>
    </div>
  );
};

export default SignUp;