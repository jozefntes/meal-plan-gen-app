import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import page from "page";
import "./SignUp.css";
import EyeIcon from "../icons/EyeIcon";
import NoEyeIcon from "../icons/NoEyeIcon";
import LogoIcon from "../icons/LogoIcon";

const SignUp = () => {
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
      await createUserWithEmailAndPassword(auth, email, password);
      page("/");
    } catch (error) {
      console.error("Error signing up:", error);
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
          <LogoIcon />
          <header>Welcome to Meal Plan</header>
          <h2>Sign Up to Meal Plan Generator</h2>
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
            {showPassword ? (
              <NoEyeIcon
                color="var(--icon-color)"
                size={24}
                className="toggle-password-button"
                onClick={passwordVisibility}
              />
            ) : (
              <EyeIcon
                color="var(--icon-color)"
                size={24}
                className="toggle-password-button"
                onClick={passwordVisibility}
              />
            )}
          </div>
          <button type="submit">Create Account</button>
          <div className="google-button-container">
            <button
              onClick={handleGoogleSignIn}
              className="google-signin-button"
            >
              <img
                src="/icons/google.svg"
                alt="Google Icon"
                className="google-icon"
              />
              Sign in with Google
            </button>
          </div>
        </form>
        <p className="link">
          Already have an account?{" "}
          <span onClick={() => page("/signin")}>Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
