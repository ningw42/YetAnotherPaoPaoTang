InputEngine = Class.extend({
	actions: {} , 
	handlers: {} ,
    listeners: [] ,

	init: function() {

	} ,

	setup: function() {
		this.bind(37 , 'left') ;
		this.bind(38 , 'up') ;
        this.bind(39 , 'right') ;
        this.bind(40 , 'down') ;
        this.bind(32 , 'bomb') ;

        document.addEventListener('keydown' , this.onKeyDown) ;
        document.addEventListener('keyup' , this.onKeyUp) ;
    } ,

    bind: function(key , action) {
    	this.handlers[key] = action ;
    } ,

    onKeyDown: function(event) {
    	var action = inputEngine.handlers[event.keyCode] ;
    	if (action)
    	{
            //gameEngine.socket.emit('send-character-movement' , {character : gameEngine.localCharacter.id, action : action, move : true}) ;
    		inputEngine.actions[action] = true ;
    		event.preventDefault() ;
    	}

    	return false ;
    } ,

    onKeyUp: function(event) {
    	var action = inputEngine.handlers[event.keyCode] ;
    	if (action)
    	{
            //gameEngine.socket.emit('send-character-movement' , {character : gameEngine.localCharacter.id, action : action, move: false}) ;
    		inputEngine.actions[action] = false ;

            var listener = inputEngine.listeners[action] ;

            if (listener) {
                console.log(listener);
                listener[0]();
            }

    		event.preventDefault() ;
    	}

    	return false ;
    } , 

    addListener: function(action , listener) {
        this.listeners[action] = this.listeners[action] || new Array() ;
        this.listeners[action].push(listener) ;
    } ,

    removeListener: function() {
        this.listeners = [] ;
    }

}) ;

inputEngine = new InputEngine() ;