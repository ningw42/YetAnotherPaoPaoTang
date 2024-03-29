var scene = gameEngine;
$(document).ready(function() {
	$('#send-btn').click(function() {
		message = $('#chat-text').val() ;
		gameEngine.socket.emit('send-chat' , {msg: message}) ;
		$('#chat-text').val('') ;
	}) ;

	$('#chat-text').keypress(function(e) {
		if (e.which == 13)
			$('#send-btn').click() ;
	}) ;

	gameEngine.socket.on('get-chat' , function(data) {
		$('#chat-room').html($('#chat-room').html() + '<span class="username">' + data.user + '</span> ' + data.msg + '<br />') ;
		$('#chat-room').scrollTop($('#chat-room').height() + $('#chat-room').scrollTop()) ;
	}) ;

	gameEngine.socket.on('get-character-movement' , function(data) {
		var action = inputEngine.handlers[data.keycode] ;
		inputEngine.actions[action] = data.move ;
		//console.log(data.keycode) ;
	}) ;

	scene.socket.on('new-player-added', function (data) {
		scene.insertNewCharacter(data.id, data.position, data.material);
		console.log('player addition broadcast received');
	});

	scene.socket.on('new-bomb-added', function (data) {
		scene.insertNewBomb(data);
		console.log('bomb addition broadcast received');
		console.log(data);
	});

	scene.socket.on('player-remove', function (data) {
		var id = data.id;
		console.log('removing other players\' character');
		scene.removeCharacterById(id);
	});

	scene.socket.on('broadcast-all-players-info', function (data) {
		scene.update(data);
		//console.log(data);
	});

	scene.socket.on('has-logged-in', function(data) {
		console.log(data + ' 你已经在线！');
		window.location.href='/';
	});

/*	scene.socket.on('has-not-logged-in', function(data) {
		console.log(data + ' 你已经在线！');
		window.location.href='/';
	});*/
});

/*
$(window).unload(function () {
	// remove from local,  redundant!
	var localCharacter = scene.localCharacter;
	var index = scene.remoteCharacters.indexOf(localCharacter);
	if (index != -1)
		scene.remoteCharacters.splice(index, 1);
	localCharacter.die();
});*/
