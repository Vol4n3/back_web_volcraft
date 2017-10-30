'use strict';

let express = require("express");
let app = express();
let bodyParser = require('body-parser');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let http = require('http');
let server = http.createServer(app);

let io = require('socket.io').listen(server);
let mongoose = require('mongoose');
let sharedsession = require("express-socket.io-session");

mongoose.connect('mongodb://localhost/volwebsite', { useMongoClient: true });
mongoose.Promise = global.Promise;

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('database connected');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));


let sessionConfig = session({
    secret:  process.env.SECRET || "changethisindev",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        mongooseConnection: db
    })
});

app.use(sessionConfig);
io.use(sharedsession(sessionConfig, {
    autoSave: true
}));

let Socket = require('./route/socket');
let ioInstance =new Socket(io);

let index = require('./route/routeApi');
app.use('/api', index);

let port = process.env.PORT || 8080;
server.listen(port, function(){
    console.log("Express server is listening on port", port);
});