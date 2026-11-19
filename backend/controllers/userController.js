
const db = require("../config/db");

// 1. View all stores with the logged-in user's rating
const getStoresForUser = async (req, res) => {
    try {
        const { name, address } = req.query;

        // Validate filters
        if (
            (name !== undefined && typeof name !== "string") ||
            (address !== undefined && typeof address !== "string")
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid search value"
            });
        }

        // Build search conditions
        const conditions = [];
        const values = [];

        if (name && name.trim()) {
            conditions.push("s.name LIKE ?");
            values.push(`%${name.trim()}%`);
        }

        if (address && address.trim()) {
            conditions.push("s.address LIKE ?");
            values.push(`%${address.trim()}%`);
        }

        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        // Allowed sorting fields
        const sortColumns = {
            name: "s.name",
            address: "s.address",
            rating: "overallRating"
        };

        const sortBy = req.query.sortBy || "name";
        const order = (
            req.query.order || "ASC"
        ).toString().toUpperCase();

        if (
            typeof sortBy !== "string" ||
            !Object.prototype.hasOwnProperty.call(sortColumns, sortBy)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid sorting field"
            });
        }

        if (!["ASC", "DESC"].includes(order)) {
            return res.status(400).json({
                success: false,
                message: "Order must be ASC or DESC"
            });
        }

        // Pagination
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 10;

        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit"
            });
        }

        const offset = (page - 1) * limit;

        // Count matching stores
        const [countRows] = await db.execute(
            `SELECT COUNT(*) AS total
             FROM stores s
             ${whereClause}`,
            values
        );

        // Fetch stores, overall rating and current user's rating
        const [stores] = await db.execute(
            `SELECT
                s.id,
                s.name,
                s.address,

                ROUND(AVG(allRatings.rating), 2)
                    AS overallRating,

                MAX(ownRating.rating)
                    AS userRating

             FROM stores s

             LEFT JOIN ratings allRatings
                ON allRatings.store_id = s.id

             LEFT JOIN ratings ownRating
                ON ownRating.store_id = s.id
                AND ownRating.user_id = ?

             ${whereClause}

             GROUP BY
                s.id,
                s.name,
                s.address

             ORDER BY
                ${sortColumns[sortBy]} ${order},
                s.id ASC

             LIMIT ? OFFSET ?`,

            [
                req.user.userId,
                ...values,
                limit,
                offset
            ]
        );

        const total = Number(countRows[0].total);

        return res.status(200).json({
            success: true,
            message: "Stores fetched successfully",

            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },

            stores
        });

    } catch (error) {
        console.error("User store listing error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch stores"
        });
    }
};


const submitRating = async (req, res) => {
    try {
        const storeId = Number(req.body.storeId);
        const rating = req.body.rating;

        // Validate store ID
        if (!Number.isInteger(storeId) || storeId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID"
            });
        }

        // Validate rating
        if (
            typeof rating !== "number" ||
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a whole number between 1 and 5"
            });
        }

        // Check whether store exists
        const [stores] = await db.execute(
            "SELECT id FROM stores WHERE id = ?",
            [storeId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        // Save rating for logged-in user
        const [result] = await db.execute(
            `INSERT INTO ratings
             (user_id, store_id, rating)
             VALUES (?, ?, ?)`,
            [
                req.user.userId,
                storeId,
                rating
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Rating submitted successfully",
            rating: {
                id: result.insertId,
                storeId,
                rating
            }
        });

    } catch (error) {
        console.error("Submit rating error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "You have already rated this store. Please modify your existing rating."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to submit rating"
        });
    }
};


const updateRating = async (req, res) => {
    try {
        const storeId = Number(req.params.storeId);
        const rating = req.body.rating;

        // Validate store ID
        if (!Number.isInteger(storeId) || storeId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID"
            });
        }

        // Validate rating
        if (
            typeof rating !== "number" ||
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a whole number between 1 and 5"
            });
        }

        // Find the existing rating of this logged-in user
        const [existingRatings] = await db.execute(
            `SELECT id
             FROM ratings
             WHERE user_id = ?
             AND store_id = ?`,
            [
                req.user.userId,
                storeId
            ]
        );

        if (existingRatings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "You have not rated this store yet"
            });
        }

        // Update existing rating
        await db.execute(
            `UPDATE ratings
             SET rating = ?
             WHERE id = ?`,
            [
                rating,
                existingRatings[0].id
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Rating updated successfully",
            rating: {
                storeId,
                rating
            }
        });

    } catch (error) {
        console.error("Update rating error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update rating"
        });
    }
};


module.exports = {
    getStoresForUser,
    submitRating,
    updateRating
};
