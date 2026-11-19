// Load environment variables FIRST
require("dotenv").config({ override: true });

const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const db = require("./config/db");
const bcrypt = require("bcryptjs");

const rl = readline.createInterface({
    input: stdin,
    output: stdout
});

async function createAdmin() {
    try {
        console.log("\nCreate Initial Administrator Account\n");

        const name = (await rl.question(
            "Admin name (20-60 characters): "
        )).trim();

        const email = (await rl.question(
            "Admin email: "
        )).trim().toLowerCase();

        const address = (await rl.question(
            "Admin address: "
        )).trim();

        const password = await rl.question(
            "Admin password (8-16 characters): "
        );

        if (name.length < 20 || name.length > 60) {
            throw new Error("Name must contain 20-60 characters");
        }

        if (address.length > 400 || !address) {
            throw new Error("Enter a valid address");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Invalid email address");
        }

        if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/.test(password)) {
            throw new Error("Password must be 8-16 characters with an uppercase letter and special character");
        }

        // Check duplicate email
        const [existing] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            throw new Error("This email is already registered");
        }

        // Get ADMIN role
        const [roles] = await db.execute(
            "SELECT id FROM roles WHERE role_name = ?",
            ["ADMIN"]
        );

        if (roles.length === 0) {
            throw new Error("ADMIN role not found");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Save administrator
        const [result] = await db.execute(
            `INSERT INTO users
            (name, email, password_hash, address, role_id)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email,
                passwordHash,
                address,
                roles[0].id
            ]
        );

        console.log("\nAdministrator created successfully!");
        console.log("Admin ID:", result.insertId);
        console.log("Admin Email:", email);

    } catch (error) {
        console.error("\nError:", error.message);

    } finally {
        rl.close();
        await db.end();
    }
}

createAdmin();
