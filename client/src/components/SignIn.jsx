import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import page from "page";
import useTheme from "../hooks/useTheme";
import "./SignUp.css";
import EyeIcon from "../icons/EyeIcon";
import NoEyeIcon from "../icons/NoEyeIcon";

const SignIn = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      if (error.code === "auth/user-not-found") {
        setErrorMessage("No user found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setErrorMessage("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email address.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      page("/");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setErrorMessage("An error occurred with Google Sign-In. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="photo-section">
        <img src="/images/signupimg.jpeg" alt="Meal Prep Photo" />
      </div>
      <div className="form-section">
        <div className="header-container">
          <div className="brand-container">
            <img
              src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
              alt="MacroMate Logo"
            />
            <h4>MacroMate</h4>
          </div>
          <h6 className="greeting">Nice to see you again</h6>
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
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit">Sign In</button>
        </form>
        <div className="google-button-container">
          <button onClick={handleGoogleSignIn} className="google-signin-button">
            <img
              src="/icons/google.svg"
              alt="Google Icon"
              className="google-icon"
            />
            <p>Sign in with Google</p>
          </button>
        </div>
        <p className="link">
          Don&apos;t have an account?{" "}
          <span onClick={() => page("/register")}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
