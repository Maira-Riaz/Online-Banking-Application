import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Signup() {
  const [username, setUsername] = useState('');  // Added state for username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    // Basic validation
    if (!username || !email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    // Sending signup data to backend
    axios.post('http://localhost:7001/signup', { username, email, password })
      .then(response => {
        alert(response.data.message); // Success message from backend
        navigate('/login'); // Redirect to Login page after successful signup
      })
      .catch(err => {
        console.error(err);
        if (err.response) {
          alert(err.response.data);  // Show the backend error message
        } else {
          alert("Error during signup. Please try again.");
        }
      });
  };

  return (
    <div className="container mt-5">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
