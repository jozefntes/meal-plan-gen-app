import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import page from "page";
import useTheme from "../hooks/useTheme";
import "./SignUp.css";
import EyeIcon from "../icons/EyeIcon";
import NoEyeIcon from "../icons/NoEyeIcon";

const SignUp = () => {
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
  
    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }
  
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      page("/");
    } catch (error) {
      console.error("Error signing up:", error);
      console.error("Error code:", error.code);
  
      switch (error.code) {
        case "auth/email-already-in-use":
          setErrorMessage("This email is already in use. Please use a different email.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Invalid email address. Please enter a valid email.");
          break;
        case "auth/weak-password":
          setErrorMessage("Password is too weak. Please use a stronger password.");
          break;
        default:
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
          <h6 className="greeting">Welcome! Sign Up</h6>
        </div>
        {errorMessage && <p className="body-s error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="email-container">
            <label htmlFor="email" className="body-s">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              placeholder="Email or Phone Number"
              className="body-s"
              onChange={handleEmailChange}
              required
            />
          </div>
          <div className="password-container">
            <label htmlFor="password" className="body-s">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter Password"
              className="body-s"
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
          <button type="submit" className="body-s">
            Create Account
          </button>
        </form>
        <div className="google-button-container">
          <button onClick={handleGoogleSignIn} className="google-signin-button">
            <img
              src="/icons/google.svg"
              alt="Google Icon"
              className="google-icon"
            />
            <p className="body-s">Sign in with Google</p>
          </button>
        </div>
        <p className="link body-s">
          Already have an account?{" "}
          <span onClick={() => page("/signin")}>Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
