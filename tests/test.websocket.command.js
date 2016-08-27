// {"endpoint":"wot.city","key":"temperature","temperature":8,"temp":8}

var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    function send() {
    	if (connection.connected) {
	    	var temp = Math.round(Math.random() * 100 + 1);

		    connection.sendUTF(JSON.stringify({
		        endpoint: 'localhost',
		        key: 'temperature',
		        temperature: temp,
		        temp: temp
		    }));
		}
		
	    setTimeout(send, 1000);
    }

    send();
});

client.connect('wss://wot.city/object/jollen12345/send', '');
