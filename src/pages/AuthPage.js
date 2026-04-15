import React, { useState } from "react";
import "./AuthPage.css";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful");
        navigate("/userinfo"); // ✅ redirect after login
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Signup successful");
        navigate("/userinfo"); // ✅ redirect after signup
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container">

      {/* LEFT IMAGE */}
      <div className="image-section"></div>

      {/* RIGHT FORM */}
      <div className="form-section">
        <div className="form-box">

          <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="subtitle">
            {isLogin
              ? "Login to your parking account"
              : "Join your apartment parking community"}
          </p>

          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {!isLogin && (
              <input
                type="password"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}

            <button type="submit">
              {isLogin ? "Login" : "Create Account"}
            </button>
          </form>

          <p className="toggle" onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "New user? Create account"
              : "Already have an account? Login"}
          </p>

        </div>
      </div>
    </div>
  );
}

export default AuthPage;