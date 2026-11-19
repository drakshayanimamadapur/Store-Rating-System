
require("dotenv").config();

const db = require("./config/db");

async function testConnection() {
    let connection;

    try {
        connection = await db.getConnection();

        const [rows] = await connection.query(
            "SELECT DATABASE() AS databaseName"
        );

        console.log("MySQL connected successfully!");
        console.log("Database:", rows[0].databaseName);

    } catch (error) {
        console.log("MySQL connection failed!");
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);

    } finally {
        if (connection) {
            connection.release();
        }

        await db.end();
    }
}

testConnection();
