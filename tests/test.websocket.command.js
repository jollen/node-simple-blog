var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    connection.sendUTF(JSON.stringify({
        command: 'UPDATE'
    }));
});

client.connect('ws://localhost:8080/', 'echo-protocol');
