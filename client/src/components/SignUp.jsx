import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import page from "page";
import './SignUp.css'

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const passwordVisibility = () => {
    setShowPassword((prev) => !prev);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    page("/home");

    
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log("Google Sign-In Success", credentialResponse);
    page("/home");
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
          <div className="google-button-container">
            <GoogleOAuthProvider clientId="897780206216-avqvo622dv42vmj5anoqcnrahdvqqtl2.apps.googleusercontent.com">
                <div className="google-login-wrapper">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                    />
                </div>
            </GoogleOAuthProvider>
          </div>
        </form>
        <p className="link">
            Already have an account? <span onClick={() => page("/signin")}>Sign in</span>

        </p>
      </div>
    </div>
  );
};

export default SignUp;