
const express = require("express");

const router = express.Router();

// Import user controller functions
const {
    getStoresForUser,
    submitRating,
    updateRating
} = require("../controllers/userController");

// Import authentication middleware
const {
    authenticateToken
} = require("../middleware/authMiddleware");

// Import authorization middleware
const {
    authorizeRoles
} = require("../middleware/roleMiddleware");

// Protect all normal user routes
router.use(
    authenticateToken,
    authorizeRoles("USER")
);

// 1. View stores with search, ratings and sorting
router.get("/stores", getStoresForUser);

// 2. Submit a new store rating
router.post("/ratings", submitRating);

// 3. Modify an existing store rating
router.put("/ratings/:storeId", updateRating);

module.exports = router;
