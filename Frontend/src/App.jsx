import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import Deposit from './Deposit';
import Withdrawal from './Withdrawal';
import Balance from './Balance';
import Topup from './Topup';
import Transfer from './Transfer';
import Dashboard from './Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountNumber, setAccountNumber] = useState(null);

  const handleLogin = (accountNumber) => {
    setIsLoggedIn(true);
    setAccountNumber(accountNumber);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAccountNumber(null);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/home">Banking App</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {!isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Signup</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/deposit">Deposit</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/withdrawal">Withdrawal</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/balance">Balance</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/topup">Topup</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/transfer">Transfer</Link>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link btn btn-link" onClick={handleLogout}>Logout</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard accountNumber={accountNumber} /> : <Navigate to="/login" />} />
        <Route path="/deposit" element={isLoggedIn ? <Deposit accountNumber={accountNumber} /> : <Navigate to="/login" />} />
        <Route path="/withdrawal" element={isLoggedIn ? <Withdrawal accountNumber={accountNumber} /> : <Navigate to="/login" />} />
        <Route path="/balance" element={isLoggedIn ? <Balance accountNumber={accountNumber} /> : <Navigate to="/login" />} />
        <Route path="/topup" element={isLoggedIn ? <Topup accountNumber={accountNumber} /> : <Navigate to="/login" />} />
        <Route path="/transfer" element={isLoggedIn ? <Transfer accountNumber={accountNumber} /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
