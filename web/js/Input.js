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

        this.bind(87, 'up2');
        this.bind(65, 'left2');
        this.bind(83, 'down2');
        this.bind(68, 'right2');
        this.bind(16, 'bomb2');

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
            gameEngine.socket.emit('send-character-movement' , {keycode : event.keyCode , move: true}) ;
    		inputEngine.actions[action] = true ;
    		event.preventDefault() ;
    	}

    	return false ;
    } ,

    onKeyUp: function(event) {
    	var action = inputEngine.handlers[event.keyCode] ;
    	if (action)
    	{
            gameEngine.socket.emit('send-character-movement' , {keycode : event.keyCode , move: false}) ;
    		inputEngine.actions[action] = false ;

            var listeners = inputEngine.listeners[action] ;
            if (listeners)
            {
                for (var i = 0 ; i < listeners.length ; i++)
                {
                    var listener = listeners[i] ;
                    listener() ;
                }
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