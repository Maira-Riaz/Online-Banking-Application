import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Balance() {
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedAccountNumber = localStorage.getItem("accountNumber");
    if (token && savedAccountNumber) {
      setIsLoggedIn(true);
      setAccountNumber(savedAccountNumber);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleCheckBalance = async (e) => {
    e.preventDefault();
    setMessage('');

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You are not logged in. Please log in to continue.");
      setIsLoggedIn(false);
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:7001/balance',
        { accountNumber: String(accountNumber) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.balance !== undefined) {
        setBalance(response.data.balance);
        setMessage('');
      } else {
        setMessage('Account found but no balance data returned.');
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setMessage('Session expired. Please log in again.');
          setIsLoggedIn(false);
          localStorage.removeItem("token");
          localStorage.removeItem("accountNumber");
          navigate('/login');
        } else {
          setMessage(err.response.data.message || 'An error occurred while fetching balance.');
        }
      } else if (err.request) {
        setMessage('No response received from server. Please check your connection.');
      } else {
        setMessage('An error occurred. Please try again later.');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          You are not logged in. Please <a href="/login">log in</a> to continue.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Check Balance</h2>
      <form onSubmit={handleCheckBalance}>
        <div className="mb-3">
          <label className="form-label">Account Number</label>
          <input
            type="text"
            className="form-control"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            readOnly
          />
        </div>
        <button type="submit" className="btn btn-primary">Check Balance</button>
      </form>
      
      {message && (
        <div className="alert alert-danger mt-3">
          {message}
        </div>
      )}
      
      {balance !== null && !message && (
        <div className="alert alert-success mt-3">
          <h3 className="mb-0">Your Balance: ${balance}</h3>
        </div>
      )}
    </div>
  );
}

export default Balance;

