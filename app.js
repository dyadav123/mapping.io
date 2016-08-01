require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var regex = require('regex');
var redis = require('redis');
var config = require('config');

require('./app_api/models/db');
require('./app_api/config/passport');

var routesApi = require('./app_api/routes/index');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
// app.use('/', routes);
app.use('/api', routesApi);


module.exports = app;
