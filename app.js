//process.env.NODE_ENV = environment variable (could be either production/development)
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config(); // take the variables I've defined in .env file and add them into process.env in my Node app
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');

//Routes:
const users = require('./routes/users');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

//security purpose
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet'); //secure your Express apps by setting various HTTP headers

const MongoDBStore = require('connect-mongo');

const dbUrl = process.env.DB_URL;
mongoose
	.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Mongo Connection opened!');
	})
	.catch((err) => {
		console.log(`Error on initial connection: `, err);
	});

mongoose.connection.on(
	'error',
	console.error.bind(
		console,
		'ERROR after initial Mongo connection was established: '
	)
);
mongoose.connection.once('open', () => {
	console.log('Mongo connection established! Database connected!! ');
});

const app = express();

// By default, $ and . characters are removed completely from user-supplied input
// in the following places:req.body, req.params, req.headers, req.query using mongoSanitize():
app.use(mongoSanitize());

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname), 'views-ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || 'thissecret';
const sessionConfig = {
	store: MongoDBStore.create({
		mongoUrl: dbUrl,
		secret: secret,

		touchAfter: 24 * 60 * 60,
	}),
	// change the default session name (connect.sid), not to hide it, but to avoid to be obvious for other people
	name: 'session',
	secret: secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		//the cookies can only be configured over https using secure:true
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));
app.use(flash());

// restricting the locations that I can fetch resources from:
const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net/',

	'https://unpkg.com/@googlemaps/markerclusterer/',

	'https://maps.googleapis.com',
	'https://maps.gstatic.com',
];

const connectSrcUrls = [
	'https://maps.googleapis.com',
	'https://maps.gstatic.com',
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',

	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net/',
];

const fontSrcUrls = ['https://fonts.gstatic.com/'];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/docliiinb/', //SHOULD MATCH my CLOUDINARY ACCOUNT!
				'https://images.unsplash.com/',
				'https://maps.googleapis.com/maps/',
				'https://maps.gstatic.com/',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//serialization = how do we store a user in the session
passport.serializeUser(User.serializeUser());
//deserialization = how do we get a user out of that session
passport.deserializeUser(User.deserializeUser());

//this middleware have to be defined before the Express Routes
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

//Express Routes
app.use('/', users);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews); // to have access to this id, we need to pass {mergeParams: true} to the express.Router()

app.get('/', (req, res) => {
	res.render('views-ejs/campgrounds/home');
});

// this will run if nothing else has matched first;
// '*' could be any of the http verbs
app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use((error, req, res, next) => {
	const { statusCode = 500, message = 'Something went wrong' } = error;
	res.status(statusCode).render('views-ejs/error', { error });
});

const port = process.env.PORT || 3000;
app.listen(3000, () => {
	console.log(`Serving on port ${port}`);
});
