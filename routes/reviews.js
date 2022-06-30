const express = require('express');

const router = express.Router({ mergeParams: true }); // to access the campground id, use mergeParams: true

const catchAsync = require('../utils/catchAsync');
const { validateReview, isReviewAuthor, isLoggedIn } = require('../middleware');

const reviews = require('../controllers/reviews');

router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview));

//remove reviews from campgrounds
router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	catchAsync(reviews.deleteReview)
);

module.exports = router;
