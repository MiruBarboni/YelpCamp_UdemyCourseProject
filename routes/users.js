const express = require('express');
const router = express.Router();

const passport = require('passport');

const users = require('../controllers/users');

//Register part
router.route('/register').get(users.renderRegister).post(users.registerUser);

//Login part
router
	.route('/login')
	.get(users.renderLogin)
	.post(
		passport.authenticate('local', {
			failureFlash: true,
			failureRedirect: '/login',
		}),
		users.login
	);

//Logout part
router.get('/logout', users.logout);

module.exports = router;
