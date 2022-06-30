const Campground = require('../models/campground');

const index = async (req, res) => {
	const campgrounds = await Campground.find({});
	const locations = campgrounds.map((camp) => {
		return camp.location;
	});
	const titles = campgrounds.map((camp) => {
		return camp.title;
	});

	res.render('views-ejs/campgrounds/index', {
		campgrounds,
		locations: locations,
		titles: titles,
	});
};

const renderNewForm = (req, res) => {
	res.render('views-ejs/campgrounds/new');
};

const createCamground = async (req, res, next) => {
	const newCampground = new Campground(req.body.campground);
	newCampground.images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	newCampground.author = req.user._id;
	await newCampground.save();

	req.flash('success', 'Successfully made a new campground!');
	res.redirect(`/campgrounds/${newCampground._id}`);
};

const showCampground = async (req, res) => {
	const campground = await Campground.findById(req.params.id)
		.populate({ path: 'reviews', populate: { path: 'author' } })
		.populate('author');
	// console.log(campground);
	const location = campground.location;

	if (!campground) {
		req.flash('error', 'Cannot find that campground');
		return res.redirect('/campgrounds');
	}

	res.render('views-ejs/campgrounds/show', { campground, location });
};

const renderUpdateForm = async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	if (!campground) {
		req.flash('error', 'Cannot find that campground');
		return res.redirect('/campgrounds');
	}
	res.render('views-ejs/campgrounds/edit', { campground });
};

const updateCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(
		id,
		req.body.campground
	);
	const images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.images.push(...images);

	await campground.save();
	if (req.body.deleteImages) {
		await campground.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
	}

	req.flash('success', 'Successfully updated the campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

const deleteCampground = async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	res.redirect('/campgrounds');
};

module.exports = {
	index,
	renderNewForm,
	createCamground,
	showCampground,
	renderUpdateForm,
	updateCampground,
	deleteCampground,
};
