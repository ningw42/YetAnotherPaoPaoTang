Flame = Entity.extend({

	bmp: null ,
	position: {} ,
	bomb: null ,


	init: function(position , bomb , location) {
		var flamesImg = gameEngine.flamesImg ;

		var spriteSheet = new createjs.SpriteSheet({
			images: [flamesImg] ,
			frames: {width: 16 , height: 16 , regX: 0 , regY: 0} ,
			animations: {
				center: [0 , 3 , 'center' , 0.2] ,
				vertical: [4 , 7 , 'vertical' , 0.2] ,
				horizontal: [8 , 11 , 'horizontal' , 0.2] ,
				up: [12 , 15 , 'up' , 0.2] ,
				right: [16 , 19 , 'right' , 0.2] ,
				down: [20 , 23 , 'down' , 0.2] ,
				left: [24 , 27 , 'left' , 0.2]
			} 
		}) ;

		this.bomb = bomb ;
		this.position = position ;

		this.bmp = new createjs.Sprite(spriteSheet , location) ;
		this.bmp.scaleX = this.bmp.scaleY = gameEngine.scale ;

		var handler = this ;
		this.bmp.addEventListener('animationend' , function() {
			handler.remove() ;
		}) ;

		var pixels = Utils.convertToBitmapPosition(position) ;
		this.bmp.x = pixels.x ;
		this.bmp.y = pixels.y ;

		gameEngine.stage.addChild(this.bmp) ;
	} ,

	update: function() {

	} ,

	remove: function() {
		if (this.bomb.explodeListener)
		{
			this.bomb.explodeListener() ;
			this.bomb.explodeListener = null ;
		}

		gameEngine.stage.removeChild(this.bmp) ;

		// remove all the flame related to the bomb
		for (var i = 0 ; i < this.bomb.flames.length ; i++)
		{
			var flame = this.bomb.flames[i] ;
			if (this == flame)
				this.bomb.flames.splice(i , 1) ;
		}

		// remove current bomb from game
		for (var i = 0 ; i < gameEngine.localBombs.length ; i++)
		{
			var bomb = gameEngine.localBombs[i] ;
			if (this.bomb == bomb) {
				gameEngine.localBombs.splice(i, 1);
			}
		}

		// remove remote bomb from game
		for (var i = 0 ; i < gameEngine.remoteBombs.length ; i++)
		{
			var bomb = gameEngine.remoteBombs[i] ;
			if (this.bomb == bomb) {
				gameEngine.remoteBombs.splice(i, 1);
			}
		}
	}
}) ;