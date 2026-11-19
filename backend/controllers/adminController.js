const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation
const passwordRegex =
    /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/;


// 1. GET ADMIN DASHBOARD STATISTICS
const getDashboardStats = async (req, res) => {
    try {
        const [[users]] = await db.execute(
            `SELECT COUNT(*) AS totalUsers
             FROM users
             WHERE role_id = 2`
        );

        const [[stores]] = await db.execute(
            `SELECT COUNT(*) AS totalStores FROM stores`
        );

        const [[ratings]] = await db.execute(
            `SELECT COUNT(*) AS totalRatings FROM ratings`
        );

        return res.status(200).json({
            success: true,
            totalUsers: Number(users.totalUsers),
            totalStores: Number(stores.totalStores),
            totalRatings: Number(ratings.totalRatings)
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch dashboard statistics"
        });
    }
};


// 2. CREATE USER
const createUser = async (req, res) => {
    try {
        const { name, email, address, password, role } = req.body;

        if (!name || !email || !address || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanAddress = address.trim();

        if (cleanName.length < 20 || cleanName.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 20 and 60 characters"
            });
        }

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (cleanAddress.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address cannot exceed 400 characters"
            });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        if (!["ADMIN", "USER"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role"
            });
        }

        const [existingUser] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        const [roleRows] = await db.execute(
            "SELECT id FROM roles WHERE role_name = ?",
            [role]
        );

        if (roleRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Role not found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await db.execute(
            `INSERT INTO users
             (name, email, password_hash, address, role_id)
             VALUES (?, ?, ?, ?, ?)`,
            [
                cleanName,
                cleanEmail,
                hashedPassword,
                cleanAddress,
                roleRows[0].id
            ]
        );

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            userId: result.insertId
        });
    } catch (error) {
        console.error("Create user error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create user"
        });
    }
};


// 3. CREATE STORE
const createStore = async (req, res) => {
    try {
        const { name, email, address } = req.body;

        if (!name || !email || !address) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanAddress = address.trim();

        if (cleanName.length < 20 || cleanName.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Store name must be between 20 and 60 characters"
            });
        }

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (cleanAddress.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address cannot exceed 400 characters"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO stores (name, email, address)
             VALUES (?, ?, ?)`,
            [cleanName, cleanEmail, cleanAddress]
        );

        return res.status(201).json({
            success: true,
            message: "Store created successfully",
            storeId: result.insertId
        });
    } catch (error) {
        console.error("Create store error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create store"
        });
    }
};


// 4. GET ALL USERS
const getUsers = async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT
                u.id,
                u.name,
                u.email,
                u.address,
                r.role_name AS role
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE r.role_name IN ('ADMIN', 'USER')
             ORDER BY u.id DESC`
        );

        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Get users error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch users"
        });
    }
};


// 5. GET USER DETAILS
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.execute(
            `SELECT
                u.id,
                u.name,
                u.email,
                u.address,
                r.role_name AS role
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error("Get user details error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch user details"
        });
    }
};


// 6. GET ALL STORES
const getStores = async (req, res) => {
    try {
        const [stores] = await db.execute(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id
             FROM stores s
             ORDER BY s.id DESC`
        );

        return res.status(200).json({
            success: true,
            stores
        });
    } catch (error) {
        console.error("Get stores error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch stores"
        });
    }
};


// 7. CREATE STORE OWNER AND ASSIGN STORE
const createStoreOwner = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { name, email, address } = req.body;

        if (!name || !email || !address) {
            return res.status(400).json({
                success: false,
                message: "Store name, email and address are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanAddress = address.trim();

        if (cleanName.length < 20 || cleanName.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Store name must be between 20 and 60 characters"
            });
        }

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (cleanAddress.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address cannot exceed 400 characters"
            });
        }

        await connection.beginTransaction();

        const [existingUser] = await connection.execute(
            "SELECT id FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (existingUser.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        const [roleRows] = await connection.execute(
            "SELECT id FROM roles WHERE role_name = 'STORE_OWNER'"
        );

        if (roleRows.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "STORE_OWNER role not found"
            });
        }

        const temporaryPassword =
            crypto.randomBytes(8).toString("base64url") + "A!";

        const hashedPassword = await bcrypt.hash(
            temporaryPassword,
            12
        );

        const [ownerResult] = await connection.execute(
            `INSERT INTO users
             (name, email, password_hash, address, role_id)
             VALUES (?, ?, ?, ?, ?)`,
            [
                cleanName,
                cleanEmail,
                hashedPassword,
                cleanAddress,
                roleRows[0].id
            ]
        );

        const ownerId = ownerResult.insertId;

        const [storeResult] = await connection.execute(
            `INSERT INTO stores
             (name, email, address, owner_id)
             VALUES (?, ?, ?, ?)`,
            [
                cleanName,
                cleanEmail,
                cleanAddress,
                ownerId
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Store Owner and Store created successfully",

            owner: {
                id: ownerId,
                email: cleanEmail,
                role: "STORE_OWNER"
            },

            store: {
                id: storeResult.insertId,
                name: cleanName,
                email: cleanEmail,
                address: cleanAddress
            },

            temporaryPassword
        });

    } catch (error) {
        await connection.rollback();

        console.error("Create Store Owner error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create Store Owner"
        });
    } finally {
        connection.release();
    }
};


// 8. GET ALL STORE OWNERS WITH THEIR STORE DETAILS
const getStoreOwners = async (req, res) => {
    try {
        const [owners] = await db.execute(
            `SELECT
                u.id AS ownerId,
                u.email AS ownerEmail,
                s.id AS storeId,
                s.name AS storeName,
                s.email AS storeEmail,
                s.address AS storeAddress
             FROM users u
             JOIN roles r ON u.role_id = r.id
             INNER JOIN stores s ON s.owner_id = u.id
             WHERE r.role_name = 'STORE_OWNER'
             ORDER BY u.id DESC`
        );

        return res.status(200).json({
            success: true,
            message: "Store Owners fetched successfully",
            storeOwners: owners
        });

    } catch (error) {
        console.error("Get Store Owners error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch Store Owners"
        });
    }
};


// 9. RESET STORE OWNER PASSWORD
const resetStoreOwnerPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required"
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        const [owners] = await db.execute(
            `SELECT u.id
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.email = ?
             AND r.role_name = 'STORE_OWNER'`,
            [cleanEmail]
        );

        if (owners.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Store Owner account not found"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await db.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [hashedPassword, owners[0].id]
        );

        return res.status(200).json({
            success: true,
            message: "Store Owner password reset successfully"
        });

    } catch (error) {
        console.error("Reset Store Owner password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reset Store Owner password"
        });
    }
};

// EXPORT ALL ADMIN FUNCTIONS
module.exports = {
    getDashboardStats,
    createUser,
    createStore,
    getUsers,
    getUserDetails,
    getStores,
    createStoreOwner,
    getStoreOwners,
    resetStoreOwnerPassword
};