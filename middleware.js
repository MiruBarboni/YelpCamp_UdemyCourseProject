const {
	validation_campgroundSchema,
	validation_reviewSchema,
} = require('./validationSchemas.js');

const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

const isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnToUrl = req.originalUrl;

		req.flash('error', 'You must be signed in first!');
		return res.redirect('/login');
	}
	next();
};

const validateCamp = (req, res, next) => {
	const { error } = validation_campgroundSchema.validate(req.body);
	if (error) {
		const errorMsg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(errorMsg, 400);
	} else {
		next();
	}
};

const isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to do that!');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

const isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to do that!');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

const validateReview = (req, res, next) => {
	const { error } = validation_reviewSchema.validate(req.body);

	if (error) {
		const errorMsg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(errorMsg, 400);
	} else {
		next();
	}
};

module.exports = {
	isLoggedIn,
	validateCamp,
	isAuthor,
	validateReview,
	isReviewAuthor,
};
