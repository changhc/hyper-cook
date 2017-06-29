var path = require('path');
var express = require('express');
//var redis   = require("redis");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
//var redisStore = require('connect-redis')(session);
var mongoose = require('mongoose');
//var client  = redis.createClient();
var debug = require('debug')('wc:server');
const MongoStore = require('connect-mongo')(session);
//var favicon = require('serve-favicon');
 
mongoose.Promise = Promise;
require('./model/helper.js');

//set server
const app = express();
const port = process.env.PORT || 3000;
app.listen(port);

//setup view engine 
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//basic setup 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(session({
    secret: 'ssshhhhh',
    // create new redis store.
    store: new MongoStore({
      url: 'mongodb://localhost/test-app',
      ttl: 14 * 24 * 60 * 60 // = 14 days. Default
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
    }
    
}));


app.use(cookieParser("secretSign#143_!223"));
app.use(express.static(path.join(__dirname, 'public')));


//set routes
app.use('/', require('./routes/login'));
app.use('/home', require('./routes/home'));
app.use('/api', require('./routes/api'));
app.use('/register', require('./routes/register'));







