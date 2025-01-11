import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Deposit() {
    const [account, setAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedAccountNumber = localStorage.getItem("accountNumber");
        if (token && savedAccountNumber) {
            setIsLoggedIn(true);
            setAccount(savedAccountNumber);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (parseFloat(amount) <= 0) {
            setMessage("Please enter a valid amount greater than 0");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("You are not logged in. Please log in to continue.");
            setIsLoggedIn(false);
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:7001/deposit',
                {
                    accountNumber: String(account),
                    amount: parseFloat(amount)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(response.data.message);
            setAmount(''); // Clear amount after successful deposit
        } catch (err) {
            console.error(err);
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setMessage('Session expired. Please log in again.');
                    setIsLoggedIn(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("accountNumber");
                    navigate('/login');
                } else {
                    setMessage(err.response.data.message || "Deposit failed. Please try again.");
                }
            } else if (err.request) {
                setMessage("No response received from server. Please check your connection.");
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
            <h3>Deposit</h3>
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
                <button type="submit" className="btn btn-success w-100">Deposit</button>
            </form>
            {message && (
                <div className={`mt-3 alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default Deposit;

