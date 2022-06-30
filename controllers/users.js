const User = require('../models/user');

const renderRegister = (req, res) => {
	res.render('views-ejs/users/register');
};

const registerUser = async (req, res, next) => {
	try {
		const { email, username, password } = req.body;
		const user = new User({ email, username });
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, (err) => {
			if (err) return next(err);
			req.flash('success', `Welcome to Yelp Camp, ${username}!`);
			res.redirect('/campgrounds');
		});
	} catch (e) {
		req.flash('error', e.message);
		res.redirect('/register');
	}
};

const renderLogin = (req, res) => {
	const url = req.session.returnToUrl || '/campgrounds';
	res.render('views-ejs/users/login', { url });
};

const login = (req, res) => {
	req.flash('success', `Hi, ${req.user.username}! You are logged in!`);
	const { redirectUrl } = req.query;
	const { id } = req.params;
	res.redirect(redirectUrl);
};

//following code won't return the redirectUrl (see explanation below:)
// const login = (req, res) => {
// 		req.flash('success', `You are logged in!`);
// 		const redirectUrl = req.session.returnToUrl || '/campgrounds';
// 		console.log('Url: ', redirectUrl); // undefined when using passport.authenticate(); haven't found why yet??
// 		res.redirect(redirectUrl);
// 	}

const logout = (req, res, next) => {
	req.logout(function (err) {
		req.flash('success', 'Goodbye!');
		res.redirect('/campgrounds');
	});
};

module.exports = { renderRegister, registerUser, renderLogin, login, logout };
