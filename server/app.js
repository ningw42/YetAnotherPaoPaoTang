var express = require('express') ,
	app = express() ,
	http = require('http') ,
	server = http.createServer(app) ,
	io = require('socket.io').listen(server) ;

app.use(express.static(__dirname + '/../web')) ;

var monitor = require('./monitor.js').start(io) ;

server.listen(8080 , function() {
	console.log('Listening on %s:%d' , server.address().address , server.address().port) ;
}) ;