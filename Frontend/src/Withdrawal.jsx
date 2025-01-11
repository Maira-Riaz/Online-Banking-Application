import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Withdrawal() {
    const [account, setAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [balance, setBalance] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const accountNumber = localStorage.getItem("accountNumber");
        if (token && accountNumber) {
            setIsLoggedIn(true);
            setAccount(accountNumber);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setBalance(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("You are not logged in. Please log in to continue.");
            setIsLoggedIn(false);
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:7001/withdrawal",
                { 
                    accountNumber: account, 
                    amount: parseFloat(amount) 
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessage(response.data.message);
            setBalance(response.data.balance);
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message || "An error occurred during withdrawal.");
                if (error.response.status === 401 || error.response.status === 403) {
                    setIsLoggedIn(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("accountNumber");
                    navigate('/login');
                }
            } else if (error.request) {
                setMessage("No response received from server. Please check your connection and try again.");
            } else {
                setMessage("An error occurred. Please try again later.");
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
            <h2>Withdrawal</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Account Number</label>
                    <input
                        type="text"
                        className="form-control"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        required
                        readOnly
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input
                        type="number"
                        className="form-control"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success w-100">
                    Withdraw
                </button>
            </form>

            {message && (
                <div className={`mt-3 alert ${balance !== null ? "alert-success" : "alert-danger"}`}>
                    {message}
                </div>
            )}

            {balance !== null && (
                <div className="mt-3 alert alert-info">
                    <strong>Remaining Balance:</strong> ${balance}
                </div>
            )}
        </div>
    );
}

export default Withdrawal;

