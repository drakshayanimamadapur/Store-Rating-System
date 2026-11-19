
const express = require("express");

const router = express.Router();

const {
    register,
    login,
    changePassword
} = require("../controllers/authController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");

// Registration
router.post("/register", register);

// Common login
router.post("/login", login);

// Change password for authenticated user
router.put(
    "/password",
    authenticateToken,
    changePassword
);

// Authenticated user profile
router.get("/me", authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: "User authenticated successfully",
        user: req.user
    });
});

// TEMPORARY ROLE TEST ENDPOINTS

router.get(
    "/test/user",
    authenticateToken,
    authorizeRoles("USER"),
    (req, res) => {
        res.json({
            success: true,
            message: "Normal user access granted"
        });
    }
);

router.get(
    "/test/admin",
    authenticateToken,
    authorizeRoles("ADMIN"),
    (req, res) => {
        res.json({
            success: true,
            message: "Admin access granted"
        });
    }
);

router.get(
    "/test/owner",
    authenticateToken,
    authorizeRoles("STORE_OWNER"),
    (req, res) => {
        res.json({
            success: true,
            message: "Store owner access granted"
        });
    }
);

module.exports = router;
