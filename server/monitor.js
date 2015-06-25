exports.start = function(io) {
	io.on('connection' , function(socket) {
		socket.on('send-chat' , function(data) {
			socket.emit('get-chat' , data) ;
			socket.broadcast.emit('get-chat' , data) ;
		}) ;

		socket.on('send-character-movement' , function(data) {
			console.log(data) ;
			socket.emit('get-character-movement' , data) ;
			socket.broadcast.emit('get-character-movement' , data) ;
		}) ;
	}) ;
}