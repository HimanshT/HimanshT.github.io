const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}
// doubt
module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); // await is used to wait for the promise to resolve
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', "Welcome to yourTrip");
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back');// throwing error
    const redirectUrl = req.session.returnTo || '/campgrounds'; // req.session.returnTo is used to redirect to the page from where we came
    delete req.session.returnTo; //
    res.redirect(redirectUrl); // redirecting to the page from where we came
}

module.exports.logout = (req, res) => {
    req.logout();// this is a function from passport which is used to logout the user from the session 
    req.flash('success', 'bye');
    res.redirect('/campgrounds');
}
