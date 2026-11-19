
const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        // Check authentication
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Please login first"
            });
        }

        // Check user role
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You do not have permission."
            });
        }

        // Allow access
        next();
    };
};

module.exports = { authorizeRoles };
