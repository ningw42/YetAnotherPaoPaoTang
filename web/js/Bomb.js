Bomb = Entity.extend({
	
	bmp: null ,
	position: null ,
	timer: 0 ,
	timerMax: 3 ,
	exploded: false ,
	flames: [] ,
	strength: 5 ,

	listener: null ,

	init: function(position) {
		var bombImg = gameEngine.bombImg ;

		var spriteSheet = new createjs.SpriteSheet({
			images: [bombImg] ,
			frames: {width: 16 , height: 16 , regX: 0 , regY: 0} ,
			animations: {
				idle:[0 , 2 , 'idle' , 0.2]
			}
		}) ;

		this.bmp = new createjs.Sprite(spriteSheet , 'idle') ;
		this.bmp.scaleX = this.bmp.scaleY = gameEngine.scale ;

		this.position = position ;
		var pixels = Utils.convertToBitmapPosition(position) ;
		this.bmp.x = pixels.x ;
		this.bmp.y = pixels.y ;

		var characters = gameEngine.getCharacters() ;
		for (var i = 0 ; i < characters.length ; i++)
		{
			var character = characters[i] ;
			if (Utils.comparePositions(character.position , this.position))
				character.escape = this ;
		}

		gameEngine.stage.addChild(this.bmp) ;
	} ,

	update: function() {
		if (this.exploded)
			return ;

		this.timer++ ;
		if (this.timer > this.timerMax * createjs.Ticker.getMeasuredFPS() && createjs.Ticker.getMeasuredFPS() != -1)
			this.explode() ;
	} ,

	explode: function() {
		this.exploded = true ;

		var positions = this.getFlamePositions() ; 
		for (var i = 0 ; i < positions.length ; i++)
		{
			var position = positions[i] ;

			if (position == this.position)
				this.flame(position , 'center') ;
			else if (position.x == this.position.x + this.strength)
				this.flame(position , 'right') ;
			else if (position.x == this.position.x - this.strength)
				this.flame(position , 'left') ;
			else if (position.y == this.position.y + this.strength)
				this.flame(position , 'down') ;
			else if (position.y == this.position.y - this.strength)
				this.flame(position , 'up') ;
			else if (position.x != this.position.x)
				this.flame(position , 'horizontal') ;
			else if (position.y != this.position.y)
				this.flame(position , 'vertical') ;

			var material = gameEngine.getTileMaterial(position) ;
			if (material == 'wall')
			{
				var tile = gameEngine.getTile(position) ;
				tile.remove() ;
			}
			else if (material == 'grass')
			{
				for (var j = 0 ; j < gameEngine.bombs.length ; j++)
				{
					var bomb = gameEngine.bombs[j] ;
					if (!bomb.exploded && Utils.comparePositions(bomb.position , position))
						bomb.explode() ;
				}
			}
		}

		this.remove() ;
	} ,

	remove: function() {
		gameEngine.stage.removeChild(this.bmp) ;
	} ,

	setExplodeListener: function(listener) {
		this.listener = listener ;
	} ,

	flame: function(position , location) {
		var flame = new Flame(position , this , location) ;
		this.flames.push(flame) ;
	} ,

	getFlamePositions: function() {
		var positions = [] ;
		positions.push(this.position) ;

		for (var i = 0 ; i < 4 ; i++)
		{
			var dirX , dirY ;
			if (i == 0)
			{
				dirX = 1 ;
				dirY = 0 ;
			}
			else if (i == 1)
			{
				dirX = -1 ;
				dirY = 0 ;
			}
			else if (i == 2)
			{
				dirX = 0 ;
				dirY = 1 ;
			}
			else if (i == 3)
			{
				dirX = 0 ;
				dirY = -1 ;
			}

			for (var j = 1 ; j <= this.strength ; j++)
			{
				var explode = true ;
				var last = false ; 

				var position = {x: this.position.x + j * dirX , y: this.position.y + j * dirY} ;

				var material = gameEngine.getTileMaterial(position) ;
				//console.log(material) ;

				if (material == 'wall' || material == 'block')
				{
					explode = false ;
					last = true ;
				}
				else if (material == 'wall')
				{
					explode = true ;
					last = true ;
				}

				if (explode)
					positions.push(position) ;

				if (last)
					break ;

			}
		}

		return positions ;

	}
}) ;




