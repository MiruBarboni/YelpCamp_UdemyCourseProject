const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, isAuthor, validateCamp } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

//uplouding images purpose
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage }); //destination for upload

router
	.route('/')
	.get(catchAsync(campgrounds.index))
	.post(
		isLoggedIn,
		upload.array('image'),
		validateCamp,
		catchAsync(campgrounds.createCamground)
	);

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
	.route('/:id')
	.get(catchAsync(campgrounds.showCampground))
	.put(
		isLoggedIn,
		isAuthor,
		upload.array('image'),
		validateCamp,
		catchAsync(campgrounds.updateCampground)
	)
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	catchAsync(campgrounds.renderUpdateForm)
);

module.exports = router;
