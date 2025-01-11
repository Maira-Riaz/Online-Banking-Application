import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Create a separate CSS file for custom styles

function Dashboard({ accountNumber }) {
  return (
    <div className="dashboard-container container mt-5">
      <div className="header">
        <h2>Welcome to Your Dashboard</h2>
        <p className="account-info">Account Number: <span>{accountNumber}</span></p>
      </div>

      <div className="banking-options mt-4">
        <h4 className="options-title">Banking Options:</h4>
        <ul className="list-group">
          <li className="list-group-item">
            <Link to="/deposit" className="dashboard-link">Deposit</Link>
          </li>
          <li className="list-group-item">
            <Link to="/withdrawal" className="dashboard-link">Withdrawal</Link>
          </li>
          <li className="list-group-item">
            <Link to="/balance" className="dashboard-link">Check Balance</Link>
          </li>
          <li className="list-group-item">
            <Link to="/transfer" className="dashboard-link">Transfer</Link>
          </li>
          <li className="list-group-item">
            <Link to="/topup" className="dashboard-link">Top Up</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
