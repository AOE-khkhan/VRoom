var HTTPS_PORT = 8443;

var fs = require('fs');
var https = require('https');
var WebSocketServer = require('ws').Server;

// Yes, SSL is required
var serverConfig = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
};

// ----------------------------------------------------------------------------------------

// Create a server for the client html page
var handleRequest = function(request, response) {
    // Render the single client html file for any request the HTTP server receives
    console.log('request received: ' + request.url);

    if(request.url == '/') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(fs.readFileSync('index.html'));
    } else if(request.url == '/test') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(fs.readFileSync('test.html'));
    } else if(request.url == '/server') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(fs.readFileSync('server.html'));
    } else if(fs.existsSync(request.url.substr(1))) {
        response.end(fs.readFileSync(request.url.substr(1)));
    }
};

var httpsServer = https.createServer(serverConfig, handleRequest);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
var wss = new WebSocketServer({server: httpsServer});

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        // Broadcast any received message to all clients
        console.log('received: %s', message);
        wss.broadcast(message);
    });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocketServer.OPEN) {
      client.send(data);

    }

  });

};
console.log('Server running. Visit https://localhost:' + HTTPS_PORT + ' in Firefox/Chrome (note the HTTPS; there is no HTTP -> HTTPS redirect!)');