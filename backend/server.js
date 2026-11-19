
const express = require("express");
const cors = require("cors");
require("dotenv").config({ override: true });

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());
// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/owner", ownerRoutes);

// Test backend API
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Store Rating System API is running successfully!"
    });
});

// Test MySQL database connection
app.get("/api/health/db", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DATABASE() AS databaseName"
        );

        res.status(200).json({
            success: true,
            message: "MySQL connected successfully!",
            database: rows[0].databaseName
        });

    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            success: false,
            message: "MySQL connection failed"
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
