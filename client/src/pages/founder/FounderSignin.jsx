import { useState, useEffect, useContext } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/signStyle.css";

const FounderSignin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const {
    setUserRole,
    setUserName,
    setUserEmail,
    setUserId,
  } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let { email, password } = formData;
      let redirectToSales = false;

      if (email.endsWith(".sales")) {
        email = email.replace(".sales", "");
        redirectToSales = true;
      }

      const res = await axios.post(
        "/auth/founder/signin",
        { email, password },
        { withCredentials: true }
      );

      setUserRole("founder");
      setUserId(res.data._id);
      setUserName(res.data.name);
      setUserEmail(res.data.email);

      navigate(redirectToSales ? "/main/results" : "/main/dashboard");
    } catch (err) {
      console.error("Signin failed:", err);
      const msg = err.response?.data?.message || "Sign-in failed. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="page-loader">
        <div className="loader-char-container">
          <div className="loader-char">
            <span className="char1">ሀ</span>
            <span className="outline-spin"></span>
          </div>
          <div className="loader-char">
            <span className="char2">ሁ</span>
            <span className="outline-spin"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h1 className="signin-title">Sign in to HaHu Bingo!</h1>

        <div className="signin-divider">
          <span className="login">Login</span>
        </div>

        {error && (
          <div className="signin-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              stroke="#b31010"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signin-form">
          <div className={`inputt-group ${formData.email ? "filled" : ""}`}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={isLoading}
            />
            <label className="label">Email</label>
          </div>

          <div className={`inputt-group password-group ${formData.password ? "filled" : ""}`}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
            <label>Password</label>

            <span className="toggle-password" onClick={togglePasswordVisibility}>
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="1.7em" height="1.7em" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="1.5" fill="#b31010" />
                  <path
                    fill="#6e6e6e"
                    d="M15.29 18.12L14 16.78l-.07-.07l-1.27-1.27a4 4 0 0 1-.61.06A3.5 3.5 0 0 1 8.5 12a4 4 0 0 1 .06-.61l-2-2L5 7.87a15.9 15.9 0 0 0-2.87 3.63a1 1 0 0 0 0 1c.63 1.09 4 6.5 9.89 6.5h.25a9.5 9.5 0 0 0 3.23-.67Zm8.42.71L19.41 18l-2-2l-9.52-9.53L6.42 5L4.71 3.29a1 1 0 0 0-1.42 1.42L5.53 7l1.75 1.7l7.31 7.3l.07.07L16 17.41l.59.59l2.7 2.71a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42Z"
                  />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                  <path
                    fill="#6e6e6e"
                    d="M12 5c-7.5 0-11 7-11 7s3.5 7 11 7s11-7 11-7s-3.5-7-11-7Zm0 12a5 5 0 1 1 0-10a5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"
                  />
                </svg>
              )}
            </span>
          </div>

          <button type="submit" className="signin-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span> Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FounderSignin;
