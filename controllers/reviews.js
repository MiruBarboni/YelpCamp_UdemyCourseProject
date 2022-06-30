const Campground = require('../models/campground');
const Review = require('../models/review');

const createReview = async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review); // review comes from show.ejs from the input name!)

	review.author = req.user._id;
	campground.reviews.push(review);
	await review.save();
	await campground.save();
	req.flash('success', 'Created new review!');
	res.redirect(`/campgrounds/${campground._id}`);
};

const deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;
	//pull operator is the recommended solution to remove from array in Mongo
	//it's going to take reviewId and pull anything with this Id out of reviews
	//where reviews are just an array of reviews
	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	req.flash('success', 'Successfully deleted review!d');
	res.redirect(`/campgrounds/${id}`);
};

module.exports = { createReview, deleteReview };
