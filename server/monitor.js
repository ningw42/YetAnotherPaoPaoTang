Characters = [];
Bombs = [];
Flames = [];
candidateID = 0;
mapOfClientAndCharacterId = {};
mapOfClientAndCharacter = {};

var Entity = require('./Entity');
exports.start = function(io) {
	io.on('connection' , function(socket) {
		console.log('currentSocket : ' + socket.id);
		socket.on('demand-on-players-list', function() {
			Characters.forEach (function (character) {
				socket.emit('send-character-detail', {id:character.id, position:character.position, material : character.material})
			});
		});

		socket.on('remote-players-done', function() {
			socket.emit('starting-load-local-player', {nextPlayersID : candidateID});
		});

		socket.on('send-chat' , function(data) {
			socket.emit('get-chat' , data) ;
			socket.broadcast.emit('get-chat' , data) ;
		});

/*		socket.on('send-character-movement' , function(data) {
			console.log(data) ;
			socket.emit('get-character-movement' , data) ;
			socket.broadcast.emit('broadcast-character-movement' , data) ;
		}) ;*/

		socket.on('add-player', function(data) {
			candidateID++;
			console.log(data);
			mapOfClientAndCharacterId[socket.id] = data.id;
			var char = new Entity.Character(data.id, data.initPosition, data.material, data.bmpPosition);
			Characters.push(char);
			mapOfClientAndCharacter[socket.id] = char;
			socket.broadcast.emit('new-player-added', {id : char.id, position : char.position, material : char.material});
		});

		socket.on('disconnect', function() {
			console.log('closed socket id : ' + socket.id);
			var charId = mapOfClientAndCharacterId[socket.id];
			console.log('remove char by id = ' + charId);
			Characters.splice(Characters.indexOf(charId), 1);
			socket.broadcast.emit('player-remove', {id : charId});
		});

		socket.on('local-player-info-update', function(data) {
			//var id = mapOfClientAndCharacterId[socket.id];
			mapOfClientAndCharacter[socket.id].position = data.position;
			mapOfClientAndCharacter[socket.id].bmpPosition = data.bmpPosition;
		});

		setInterval(function() {
			// broadcast data 25 times per second
			if (Characters.length > 0) {
				socket.emit('broadcast-all-players-info', {characters: Characters, bombs: Bombs});
				socket.broadcast.emit('broadcast-all-players-info', {characters: Characters, bombs: Bombs});
			}
		}, 200);
	}) ;
};