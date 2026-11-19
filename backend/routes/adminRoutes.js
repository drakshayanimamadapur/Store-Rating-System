
const express = require("express");

const router = express.Router();

const {
    getDashboardStats,
    createUser,
    createStore,
    getUsers,
    getUserDetails,
    getStores,
    createStoreOwner,
    getStoreOwners,
    resetStoreOwnerPassword
} = require("../controllers/adminController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");

// Protect every admin route
router.use(
    authenticateToken,
    authorizeRoles("ADMIN")
);

// Admin dashboard statistics
router.get("/dashboard", getDashboardStats);

// Add normal user or admin
router.post("/users", createUser);

// Add new store
router.post("/stores", createStore);

// Create Store Owner and assign store
router.post("/store-owners", createStoreOwner);

// View users
router.get("/users", getUsers);

// View individual user details
router.get("/users/:id", getUserDetails);

// Get all stores
router.get("/stores", getStores);

// Get all Store Owners with their store details
router.get("/store-owners", getStoreOwners);

router.put("/store-owners/reset-password", resetStoreOwnerPassword);

router.use(authenticateToken, authorizeRoles("ADMIN"));

module.exports = router;
