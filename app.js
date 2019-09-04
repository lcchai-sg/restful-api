const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const fs = require('file-system');
const path = require('path');
const rfs = require('rotating-file-stream');
const config = require('./config');

const app = express();

// log files directory
const logDirectory = path.join(__dirname, config.logFolder);
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
});
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// connect to Mongo db
mongoose.connect(config.dbconn, { useNewUrlParser: true })
.then(result => console.log('Mongo DB connected...'))
.catch(err => console.log('DB connection error: ', err));

// uploading files
const uploadsDirectory = path.join(__dirname, config.uploadFolder);
fs.existsSync(uploadsDirectory) || fs.mkdirSync(uploadsDirectory);
app.use('/uploads', express.static(config.uploadFolder));

// extract json data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set header
app.use((req, res, next) => {
    // from any client
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200),json({});
    }
    next();
});

// declare routes
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

// routes to handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

// handle errors that routes not handled
app.use((req, res, next) => {
    const error = new Error('Routes Not found');
    error.status = 404;
    next(error);
});

// handle all other errors
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;