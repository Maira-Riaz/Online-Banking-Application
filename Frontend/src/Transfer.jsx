import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Transfer() {
    const [fromAccount, setFromAccount] = useState("");
    const [toAccount, setToAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [newBalance, setNewBalance] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedAccountNumber = localStorage.getItem("accountNumber");
        if (token && savedAccountNumber) {
            setIsLoggedIn(true);
            setFromAccount(savedAccountNumber);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setMessage("");
        setNewBalance(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("You are not logged in. Please log in to continue.");
            setIsLoggedIn(false);
            navigate('/login');
            return;
        }

        if (fromAccount === toAccount) {
            setMessage("Cannot transfer to the same account");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:7001/transfer",
                {
                    senderAccount: fromAccount,
                    receiverAccount: toAccount,
                    amount: parseFloat(amount)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setMessage(response.data.message);
            setNewBalance(response.data.newBalance);
            setToAccount("");
            setAmount("");
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    setMessage('Session expired. Please log in again.');
                    setIsLoggedIn(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("accountNumber");
                    navigate('/login');
                } else {
                    setMessage(error.response.data.message || "Transfer failed. Please try again.");
                }
            } else if (error.request) {
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
            <h3>Transfer Funds</h3>
            <form onSubmit={handleTransfer}>
                <div className="mb-3">
                    <label className="form-label">From Account</label>
                    <input
                        type="text"
                        className="form-control"
                        value={fromAccount}
                        readOnly
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">To Account</label>
                    <input
                        type="text"
                        className="form-control"
                        value={toAccount}
                        onChange={(e) => setToAccount(e.target.value)}
                        required
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
                        step="0.01"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-warning w-100">Transfer</button>
            </form>
            {message && (
                <div className={`mt-3 alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                </div>
            )}
            {newBalance !== null && (
                <div className="mt-3 alert alert-info">
                    <strong>New Balance:</strong> ${newBalance.toFixed(2)}
                </div>
            )}
        </div>
    );
}

export default Transfer;

