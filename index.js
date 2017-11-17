'use strict';

let express = require("express");
let app = express();
let bodyParser = require('body-parser');

let http = require('http');
let server = http.createServer(app);

let io = require('socket.io').listen(server);
let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/volwebsite', { useMongoClient: true });
mongoose.Promise = global.Promise;

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('database connected');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/img',express.static(__dirname + '/public/img'));

let Socket = require('./route/socket');
let ioInstance =new Socket(io);

let index = require('./route/routeApi');
app.use('/api', index);

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: __dirname + '/public/dist' });
});

let port = process.env.PORT || 8088;
server.listen(port, function(){
    console.log("Express server is listening on port", port);
});