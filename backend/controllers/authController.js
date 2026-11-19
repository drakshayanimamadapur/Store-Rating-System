
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Normal user registration
const register = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;

        // 1. Check required fields
        if (!name || !email || !address || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanAddress = address.trim();

        // 2. Validate name
        if (cleanName.length < 20 || cleanName.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 20 and 60 characters"
            });
        }

        // 3. Validate address
        if (cleanAddress.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address cannot exceed 400 characters"
            });
        }

        // 4. Validate email
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // 5. Validate password
        const passwordRegex =
    /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be 8-16 characters with an uppercase letter and a special character"
            });
        }

        // 6. Check duplicate email
        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // 7. Get normal user role
        const [roles] = await db.execute(
            "SELECT id FROM roles WHERE role_name = ?",
            ["USER"]
        );

        if (roles.length === 0) {
            return res.status(500).json({
                success: false,
                message: "USER role not found"
            });
        }

        // 8. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 9. Save user in MySQL
        const [result] = await db.execute(
            `INSERT INTO users
            (name, email, password_hash, address, role_id)
            VALUES (?, ?, ?, ?, ?)`,
            [
                cleanName,
                cleanEmail,
                hashedPassword,
                cleanAddress,
                roles[0].id
            ]
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: result.insertId,
                name: cleanName,
                email: cleanEmail,
                address: cleanAddress,
                role: "USER"
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed due to a server error"
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (
            !email ||
            !password ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Find user and role
        const [users] = await db.execute(
            `SELECT
                u.id,
                u.name,
                u.email,
                u.address,
                u.password_hash,
                r.role_name AS role
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.email = ?`,
            [cleanEmail]
        );

        // Check user existence
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "JWT configuration is missing"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Return login response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed due to a server error"
        });
    }
};


const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Check required fields
        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Current and new passwords are required"
            });
        }

        // Validate new password
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "New password must be 8-16 characters with an uppercase letter and a special character"
            });
        }

        // Get logged-in user
        const [users] = await db.execute(
            "SELECT id, password_hash FROM users WHERE id = ?",
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        // Verify current password
        const isValid = await bcrypt.compare(
            currentPassword,
            user.password_hash
        );

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Prevent reusing the same password
        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password_hash
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(
            newPassword,
            12
        );

        // Update database
        await db.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [newPasswordHash, user.id]
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to change password"
        });
    }
};

module.exports = { register, login, changePassword };
