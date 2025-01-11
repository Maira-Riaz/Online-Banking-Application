import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:7001/login', { email, password });
      if (response.data.message === "Login successful") {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('accountNumber', response.data.accountNumber);
        alert("Login successful!");
        onLogin(response.data.accountNumber);
        navigate('/dashboard');
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        alert(err.response.data);
      } else {
        alert("Error during login. Please try again.");
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}

export default Login;

