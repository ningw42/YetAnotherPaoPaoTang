Characters = [];
Bombs = [];
mapOfCharacterAndBombList = [];

candidateID = 0;
mapOfClientAndCharacterId = {};
mapOfClientAndCharacter = {};

LoggedPlayers = [];
var mysql = require('./Database');
mysql.connect();
var Entity = require('./Entity');
exports.start = function(io) {
	io.on('connection' , function(socket) {
		var cookie = socket.handshake.headers.cookie;
		var username = null;
		if (cookie) {
			username = cookie.substring(cookie.indexOf('=') + 1, cookie.indexOf(';'));
			if (LoggedPlayers[username] == true) {
				socket.emit('has-logged-in');
			} else {
				LoggedPlayers[username] = true;
			}
		}

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
			console.log(username + "fuck");
			socket.emit('get-chat' , {user: username, msg : data.msg}) ;
			socket.broadcast.emit('get-chat' , {user: username, msg : data.msg}) ;
		});

		socket.on('add-player', function(data) {
			candidateID++;
			console.log(data);
			mapOfClientAndCharacterId[socket.id] = data.id;
			var char = new Entity.Character(data.id, data.initPosition, data.material, data.bmpPosition);
			Characters.push(char);
			mapOfClientAndCharacter[socket.id] = char;
			socket.broadcast.emit('new-player-added', {id : char.id, position : char.position, material : char.material});
		});

		socket.on('add-bomb', function (data) {
			var bombPosition = data.position;
			var bombCharId = data.characterId;
			var bombId = data.id;

			var bomb = null;
			var bombListByCharacterId = mapOfCharacterAndBombList[bombCharId];
			if (bombListByCharacterId) {
				bomb = new Entity.Bomb(bombPosition, bombCharId, bombId);
				bombListByCharacterId[bombId] = bomb;
				Bombs.push(bomb);
			} else {
				var bombList = [];
				bomb = new Entity.Bomb(bombPosition, bombCharId, bombId);
				bombList[bombId] = bomb;
				mapOfCharacterAndBombList[bombCharId] = bombList;
				Bombs.push(bomb);
			}
			socket.broadcast.emit('new-bomb-added', bomb);
		});

		socket.on('remove-bomb', function (data) {
			var bombCharId = data.characterId;
			var bombId = data.id;

			// remove from list
			for (var i = 0; i < Bombs.length; i++) {
				if (Bombs[i].id == bombId && Bombs[i].characterId == bombCharId) {
					Bombs.splice(i, 1);
				}
			}

			// remove from map
			mapOfCharacterAndBombList[bombCharId][bombId] = null;
		});

		socket.on('disconnect', function() {
			console.log('closed socket id : ' + socket.id);
			var charId = mapOfClientAndCharacterId[socket.id];
			console.log('remove char by id = ' + charId);
			Characters.splice(Characters.indexOf(charId), 1);
			socket.broadcast.emit('player-remove', {id : charId});

			LoggedPlayers[username] = false;
			socket.handshake.headers.cookie = null;
		});

		socket.on('local-player-info-update', function(data) {
			//var id = mapOfClientAndCharacterId[socket.id];
			mapOfClientAndCharacter[socket.id].position = data.position;
			mapOfClientAndCharacter[socket.id].bmpPosition = data.bmpPosition;
		});

		socket.on('report-score', function(data) {
			var score = data.score;
			console.log(score + ' ,' + username + ' , fucker');
			mysql.query('INSERT INTO global_records (score, username) VALUES ( ' + score + ', \'' + username + '\')', function(err, rows, fields) {
				console.log(rows);
			});
		});
/*		socket.on('local-character-die', function (data) {
			for(var i = 0; i < Characters.length; i++) {
				if (Characters[i].id == data.id) {
					Characters.splice([i, 1]);
					break;
				}
			}
			mapOfClientAndCharacter[socket.id] = null;
		});*/
		setInterval(function() {
			// broadcast data 25 times per second
			if (Characters.length > 0) {
				socket.emit('broadcast-all-players-info', {characters: Characters, bombs: mapOfCharacterAndBombList});
				socket.broadcast.emit('broadcast-all-players-info', {characters: Characters, bombs: mapOfCharacterAndBombList});
			}
		}, 100);
	}) ;
};