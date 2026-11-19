
const db = require("../config/db");

// GET USER ID FROM AUTHENTICATION TOKEN
const getOwnerId = (req) => {
    return (
        req.user?.id ??
        req.user?.userId ??
        req.user?.user_id ??
        req.user?.sub
    );
};

// GET LOGGED-IN OWNER'S DASHBOARD
const getOwnerDashboard = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);

        if (!ownerId) {
            console.error("Owner ID missing. Decoded token:", req.user);

            return res.status(401).json({
                success: false,
                message: "Unable to identify logged-in Store Owner. Please login again."
            });
        }

        // 1. GET ASSIGNED STORE
        const [stores] = await db.execute(
            `SELECT id, name, email, address
             FROM stores
             WHERE owner_id = ?`,
            [ownerId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No store is assigned to this account"
            });
        }

        const store = stores[0];

        // 2. GET RATING SUMMARY
        const [summaryRows] = await db.execute(
            `SELECT
                COUNT(*) AS totalRatings,
                ROUND(AVG(rating), 2) AS averageRating
             FROM ratings
             WHERE store_id = ?`,
            [store.id]
        );

        const summary = {
            totalRatings: Number(summaryRows[0].totalRatings),
            averageRating: Number(summaryRows[0].averageRating || 0)
        };

        // 3. GET RATING DISTRIBUTION
        const [distributionRows] = await db.execute(
            `SELECT rating, COUNT(*) AS total
             FROM ratings
             WHERE store_id = ?
             GROUP BY rating
             ORDER BY rating`,
            [store.id]
        );

        const distribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        distributionRows.forEach((item) => {
            distribution[item.rating] = Number(item.total);
        });

        // 4. GET CUSTOMER RATINGS
        const [ratings] = await db.execute(
            `SELECT
                r.id,
                r.rating,
                r.created_at AS createdAt,
                u.name AS customerName,
                u.email AS customerEmail
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             WHERE r.store_id = ?
             ORDER BY r.created_at DESC`,
            [store.id]
        );

        // 5. SEND DASHBOARD DATA
        return res.status(200).json({
            success: true,
            store,
            summary,
            distribution,
            ratings,

            // Backward-compatible response fields
            statistics: {
                ...summary,
                ratingDistribution: distribution
            },
            customerRatings: ratings
        });

    } catch (error) {
        console.error("Owner dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch owner dashboard"
        });
    }
};

// GET CUSTOMER RATINGS
const getOwnerRatings = async (req, res) => {
    try {
        const ownerId = getOwnerId(req);

        if (!ownerId) {
            return res.status(401).json({
                success: false,
                message: "Unable to identify logged-in Store Owner"
            });
        }

        const [stores] = await db.execute(
            `SELECT id
             FROM stores
             WHERE owner_id = ?`,
            [ownerId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No store is assigned to this account"
            });
        }

        const [ratings] = await db.execute(
            `SELECT
                r.id,
                r.rating,
                r.created_at AS createdAt,
                u.name AS customerName,
                u.email AS customerEmail
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             WHERE r.store_id = ?
             ORDER BY r.created_at DESC`,
            [stores[0].id]
        );

        return res.status(200).json({
            success: true,
            ratings
        });

    } catch (error) {
        console.error("Owner ratings error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch customer ratings"
        });
    }
};

module.exports = {
    getOwnerDashboard,
    getOwnerRatings
};
