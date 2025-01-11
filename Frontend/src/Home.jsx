import React from "react";
import "./Home.css";

function Home() {
  return (
    <div className="container mt-5 text-center">
      <h1>Welcome to the Banking App</h1>
      <p>Your one-stop solution for secure banking transactions.</p>

      {/* Currency Animation */}
      <div className="currency-container">
        <div className="currency-icon">💵</div> {/* Dollar Bill */}
        <div className="currency-icon">💶</div> {/* Euro Bill */}
        <div className="currency-icon">💷</div> {/* Pound Bill */}
        <div className="currency-icon">💰</div> {/* Money Bag */}
        <div className="currency-icon">🏦</div> {/* Bank Building */}
      </div>

      <p>
        Use the navigation bar above to register, login, or perform banking actions like deposit and withdrawal.
      </p>
    </div>
  );
}

export default Home;
