import { useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "../../styles/signStyle.css"; // Import your black palette style.css

const FounderSignup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/founder/signup", formData);
      navigate("/founder/signin");
    } catch (error) {
      console.error("Signup failed:", error);
      // You can show a nice error popup if you want
    }
  };

  return (
    <div className="founder-signin-container">
      <h1 className="founder-signin-title">Founder Sign Up</h1>
      <form onSubmit={handleSubmit} className="founder-signin-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="founder-signin-button">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default FounderSignup;
