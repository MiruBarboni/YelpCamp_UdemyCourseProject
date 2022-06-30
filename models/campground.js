const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
	title: String,
	images: [ImageSchema],
	price: Number,
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			//Review comes from here: mongoose.model('Review', ReviewSchema);
			ref: 'Review',
		},
	],
});

//query middleware;
// we used findOneAndDelete middleware because we have used findByIdAndDelete() when implementing the CRUD
CampgroundSchema.post('findOneAndDelete', async function (doc) {
	//if doc was found and deleted then:
	if (doc) {
		await Review.deleteMany({ _id: { $in: doc.reviews } });
	}
});

const Campgound = mongoose.model('Campground', CampgroundSchema);
module.exports = Campgound;
