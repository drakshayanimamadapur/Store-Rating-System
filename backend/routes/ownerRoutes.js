
const express = require("express");
const router = express.Router();

const {
    getOwnerDashboard,
    getOwnerRatings
} = require("../controllers/ownerController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");

// Only logged-in STORE_OWNER accounts can access these routes
router.use(
    authenticateToken,
    authorizeRoles("STORE_OWNER")
);

// Owner dashboard
router.get("/dashboard", getOwnerDashboard);

// Customer ratings
router.get("/ratings", getOwnerRatings);

module.exports = router;
