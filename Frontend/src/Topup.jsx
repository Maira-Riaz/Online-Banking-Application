import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Topup() {
    const [account, setAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
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

    const handleTopup = async (e) => {
        e.preventDefault();
        setMessage("");

        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("You are not logged in. Please log in to continue.");
            setIsLoggedIn(false);
            navigate('/login');
            return;
        }

        // Validate phone number
        if (!/^\d{11}$/.test(phone)) {
            setMessage("Please enter a valid 11-digit phone number.");
            return;
        }

        // Validate amount
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            setMessage("Please enter a valid amount greater than 0.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:7001/topup",
                {
                    accountNumber: String(account),
                    amount: parseFloat(amount),
                    phone
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setMessage(response.data.message);
            if (response.data.success) {
                setAmount("");
                setPhone("");
            }
        } catch (error) {
            console.error("Topup error:", error);
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    setMessage('Session expired. Please log in again.');
                    setIsLoggedIn(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("accountNumber");
                    navigate('/login');
                } else {
                    setMessage(error.response.data.message || "Top-up failed. Please try again.");
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
            <h2>Mobile Top-up</h2>
            <form onSubmit={handleTopup}>
                <div className="mb-3">
                    <label className="form-label">Account Number</label>
                    <input
                        type="text"
                        className="form-control"
                        value={account}
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
                        step="0.01"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Phone Number (11 digits)</label>
                    <input
                        type="tel"
                        className="form-control"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        pattern="\d{11}"
                        maxLength="11"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success w-100">Top-up</button>
            </form>
            {message && (
                <div className={`mt-3 alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default Topup;

