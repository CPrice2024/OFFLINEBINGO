import { useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "../../styles/signStyle.css";

const SupportSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post("/auth/support/signup", formData);
      navigate("/support/signin", { state: { success: "Registration successful! Please sign in." } });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="founder-signin-container">
      <h1 className="founder-signin-title">Support Sign Up</h1>
      {error && <div className="founder-error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="founder-signin-form">
        <div className="founder-form-group">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
          />
        </div>
        
        <div className="founder-form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="founder-form-group">
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>
        
        <div className="founder-form-group">
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            pattern="[0-9]{10,15}"
            title="Please enter a valid phone number"
          />
        </div>
        
        <div className="founder-form-group">
        <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
            minLength={2}
          />
        </div>
        
        <button 
          type="submit" 
          className="founder-signin-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      
      <p className="founder-login-redirect">
        Already have an account? <span onClick={() => navigate("/support/signin")}>Login</span>
      </p>
    </div>
  );
};

export default SupportSignup;