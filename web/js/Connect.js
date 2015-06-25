$(document).ready(function() {
	$('#send-btn').click(function() {
		message = $('#chat-text').val() ;
		username = 'steven5538' ;
		gameEngine.socket.emit('send-chat' , {user: username , msg: message}) ;
		$('#chat-text').val('') ;
	}) ;

	$('#chat-text').keypress(function(e) {
		if (e.which == 13)
			$('#send-btn').click() ;
	}) ;

	gameEngine.socket.on('get-chat' , function(data) {
		console.log(data.user + ': ' + data.msg) ;
		$('#chat-room').html($('#chat-room').html() + '<span class="username">' + data.user + '</span> ' + data.msg + '<br />') ;
		$('#chat-room').scrollTop($('#chat-room').height() + $('#chat-room').scrollTop()) ;
	}) ;

	gameEngine.socket.on('get-character-movement' , function(data) {
		var action = inputEngine.handlers[data.keycode] ;
		inputEngine.actions[action] = data.move ;
		//console.log(data.keycode) ;
	}) ;
}) ;