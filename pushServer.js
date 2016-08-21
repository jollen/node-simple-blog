var WebSocketServer = require('websocket').server;
var http = require('http');
var mongoose = require('mongoose');
var express = require('express');

var app = express();

// config
var config = require('./config');

// keep reference to config
app.config = config;

// keep reference to client connections
app.connections = [];

//setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
  //and... we have a data store
  console.log('mongoose connection success');
});

//config data models
require('./models')(app, mongoose);

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

var dispatch = function(data) {
    var payload = {
        data: data
    };

    for (i = 0; i < app.connections.length; i++) {
        app.connections[i].sendUTF( JSON.stringify(payload) );
    }
};

wsServer.on('request', function(request) {
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    app.connections.push(connection);

    connection.on('message', function(message) {
        app.db.models.Post.find({}, function(err, posts) {
            if (err) return connection.sendUTF('{}');

            var data = JSON.parse(message.utf8Data);

            if (message.type === 'utf8' && 
                data.command === 'UPDATE') {
                dispatch(posts.length);
            }
        });
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
