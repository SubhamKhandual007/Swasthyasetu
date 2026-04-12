const isAdmin = (req, res, next) => {
    // Check if user is logged in and is an admin
    if (req.session && req.session.user && req.session.user.userType === 'admin') {
        return next();
    }

    // If you want doctors to also have access, you can add:
    // || (req.session && req.session.doctor)

    return res.status(403).json({ error: "Access denied. Admin privileges required." });
};

module.exports = { isAdmin };
