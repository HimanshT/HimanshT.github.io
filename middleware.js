module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originUrl;
        req.flash('error', 'you must be logged in');
        return res.redirect('/login');
    }
    next();
}