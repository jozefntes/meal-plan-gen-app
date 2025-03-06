import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import page from "page";
import "./SignUp.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const passwordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      page("/");
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      page("/");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="container">
      <div className="photo-section">
        <img src="/images/signupimg.jpeg" alt="Meal Prep Photo" />
      </div>
      <div className="form-section">
        <div className="header-container">
        <img src="/icons/logo.svg" alt="Meal Prep Logo" />
        <header>Welcome Back to Meal Plan</header>
        <h2>Sign In to Meal Plan Generator</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <br />
            <input
              type="email"
              id="email"
              value={email}
              placeholder="Email or Phone Number"
              onChange={handleEmailChange}
              required
            />
          </div>
          <div className="password-container">
            <label htmlFor="password">Password</label>
            <br />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <img
              src={
                showPassword
                  ? "icons/noShowPassword.svg"
                  : "icons/showPassword.svg"
              }
              alt="Toggle Password Visibility"
              className="toggle-password-button"
              onClick={passwordVisibility}
            />
          </div>
          <button type="submit">Sign In</button>
        </form>
        <div className="google-button-container">
          <button onClick={handleGoogleSignIn} className="google-signin-button">
          <img src="/icons/google.svg" alt="Google Icon" className="google-icon" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
