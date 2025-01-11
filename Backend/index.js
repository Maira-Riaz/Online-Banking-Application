require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 7001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_KEY, { expiresIn: '1h' });
};

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accountNumber: { type: String },
    balance: { type: Number, default: 0 },
});

const UserModel = mongoose.model('User', userSchema);

// Helper function to generate a 10-digit account number
const generateAccountNumber = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();

// Middleware to verify token

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;
        next();
    });
};

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to the Banking Application API!");
});

// Signup User

app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json("Username, email, and password are required");
    }

    try {
        const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json("User with this email or username already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const accountNumber = generateAccountNumber();
        const newUser = new UserModel({ username, email, password: hashedPassword, accountNumber });

        await newUser.save();
        res.json({ message: "Signup successful", accountNumber });
    } catch (err) {
        res.status(500).json("Error during signup: " + err.message);
    }
});

// Login User
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json("Email and password are required");
    }

    try {
        const user = await UserModel.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = generateToken(user._id);
            res.json({
                message: "Login successful",
                token,
                accountNumber: user.accountNumber,
                balance: user.balance,
            });
        } else {
            res.status(401).json("Invalid credentials");
        }
    } catch (err) {
        res.status(500).json("Error during login: " + err.message);
    }
});

// Deposit Funds
app.post("/deposit", authenticateToken, async (req, res) => {
    const { accountNumber, amount } = req.body;

    if (!accountNumber) {
        return res.status(400).json({ message: "Account number is missing" });
    }
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid deposit amount" });
    }

    try {
        const user = await UserModel.findOne({ accountNumber });
        if (!user) {
            return res.status(404).json({ message: "Account not found" });
        }

        user.balance += amount;
        await user.save();

        res.json({ message: `Deposit successful! New Balance: ${user.balance}` });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// Withdrawal Funds
app.post("/withdrawal", authenticateToken, async (req, res) => {
    const { accountNumber, amount } = req.body;

    if (!accountNumber) {
        return res.status(400).json({ message: "Account number is required" });
    }
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    try {
        const user = await UserModel.findOne({ accountNumber });
        if (!user) {
            return res.status(404).json({ message: "Account not found" });
        }

        if (user.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        user.balance -= amount;
        await user.save();

        res.json({ 
            message: "Withdrawal successful!",
            balance: user.balance // Include remaining balance
        });
    } catch (err) {
        res.status(500).json({ message: "Error during withdrawal", error: err.message });
    }
});

// Transfer Funds
app.post("/transfer", authenticateToken, async (req, res) => {
    const { senderAccount, receiverAccount, amount } = req.body;

    if (!senderAccount || !receiverAccount || !amount || amount <= 0) {
        return res.status(400).json({ message: "Valid sender, receiver, and amount are required" });
    }

    try {
        const sender = await UserModel.findOne({ accountNumber: senderAccount });
        if (!sender) return res.status(404).json({ message: "Sender account not found" });

        if (sender.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const receiver = await UserModel.findOne({ accountNumber: receiverAccount });
        if (!receiver) return res.status(404).json({ message: "Receiver account not found" });

        sender.balance -= parseFloat(amount);
        receiver.balance += parseFloat(amount);

        await sender.save();
        await receiver.save();

        res.json({ 
            message: "Transfer successful!",
            newBalance: sender.balance
        });
    } catch (err) {
        console.error("Error during transfer:", err.message);
        res.status(500).json({ message: "Error during transfer: " + err.message });
    }
});


// Check Balance
app.post("/balance", authenticateToken, async (req, res) => {
    const { accountNumber } = req.body;

    if (!accountNumber) {
        return res.status(400).json({ message: "Account number is missing" });
    }

    try {
        const user = await UserModel.findOne({ accountNumber });
        if (!user) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.json({ balance: user.balance });
    } catch (err) {
        res.status(500).json("Error fetching balance: " + err.message);
    }
});


// Top-up Funds
app.post("/topup", authenticateToken, async (req, res) => {
    const { accountNumber, amount, phone } = req.body;

    // Validate input
    if (!accountNumber || !amount || !phone) {
        return res.status(400).json({ success: false, message: "Valid account number, top-up amount, and phone number are required" });
    }

    if (!/^\d{11}$/.test(phone)) {
        return res.status(400).json({ success: false, message: "Invalid phone number. Please enter 11 digits." });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ success: false, message: "Invalid amount. Please enter a positive number." });
    }

    try {
        // Find user by account number
        const user = await UserModel.findOne({ accountNumber });
        if (!user) {
            return res.status(404).json({ success: false, message: "Account not found" });
        }

        // Check if user has sufficient balance
        if (user.balance < parseFloat(amount)) {
            return res.status(400).json({ success: false, message: "Insufficient balance for top-up" });
        }

        // Deduct top-up amount from user's balance
        user.balance -= parseFloat(amount);
        await user.save();

        // Here you would typically integrate with a mobile top-up API
        // For this example, we'll just simulate a successful top-up
        console.log(`Simulated top-up of ${amount} to phone number ${phone}`);

        res.json({ success: true, message: `Top-up successful! ${amount} sent to ${phone}. New Balance: ${user.balance}` });
    } catch (err) {
        console.error("Error during top-up:", err.message);
        res.status(500).json({ success: false, message: "Internal server error: " + err.message });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
