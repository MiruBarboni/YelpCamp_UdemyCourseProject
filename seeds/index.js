const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose
	.connect(
		'mongodb+srv://mirunaadmin:Procus123@learning.xnr3u.mongodb.net/yelpCamp?retryWrites=true&w=majority',
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => {
		console.log('Mongo Connection opened!');
	})
	.catch((err) => {
		console.log(`Error on initial connection: `, err);
	});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 10; i++) {
		const random = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: '62a9dc70a88a1c50a0ae847c',
			title: `${sample(descriptors)} ${sample(places)}`,
			location: `${cities[random].city}, ${cities[random].state}`,
			images: [
				{
					url: 'https://res.cloudinary.com/docliiinb/image/upload/v1655812178/YelpCamp/rzto81wmub36if42knl5.jpg',
					filename: 'YelpCamp/rzto81wmub36if42knl5',
				},
				{
					url: 'https://res.cloudinary.com/docliiinb/image/upload/v1655812179/YelpCamp/aqh4gkkg47vpelofn2s9.jpg',
					filename: 'YelpCamp/aqh4gkkg47vpelofn2s9',
				},
				{
					url: 'https://res.cloudinary.com/docliiinb/image/upload/v1655812180/YelpCamp/wcll1h9boxsd7pvrfdpv.jpg',
					filename: 'YelpCamp/wcll1h9boxsd7pvrfdpv',
				},
			],
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi vero obcaecati expedita veritatis tempora commodi, eaque, tenetur quae ipsam quibusdam inventore labore nam, laboriosam quaerat. Fugiat voluptatem repudiandae ipsum earum?',
			price,
		});
		await camp.save();
		console.log(camp);
	}
};
seedDB().then(() => {
	mongoose.connection.close();
});
