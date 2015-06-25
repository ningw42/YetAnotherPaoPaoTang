Tile = Entity.extend({

	bmp: null ,
	position: null ,
	material: null ,

	init: function(material , position) {
		var tilesImg = gameEngine.tilesImg ;
		this.material = material ;

		var spriteSheet = new createjs.SpriteSheet({
			images: [tilesImg] ,
			frames: {width: 16 , height: 16 , regX: 0 , regY: 0} ,
			animations: {
				grass: [0 , 0 , 'grass' , 1] ,
				wall: [1 , 1 , 'wall' , 1] ,
				block: [2 ,2 , 'block' , 1] ,
				crash: [7 , 13 , 'crash' , 0.2] ,
				powerup: [14 , 14 , 'powerup' , 1] ,
				bombup: [15 , 15 , 'bombup' , 1] ,
				speedup: [16 , 16 , 'speedup' , 1]
			} 
		}) ;

		spriteSheet.getAnimation('crash').next = 'grass' ;
		this.bmp = new createjs.Sprite(spriteSheet , material) ;
		this.bmp.scaleX = this.bmp.scaleY = gameEngine.scale ;

		this.position = position ;
		var pixels = Utils.convertToBitmapPosition(position) ;
		this.bmp.x = pixels.x ;
		this.bmp.y = pixels.y ;

		gameEngine.stage.addChild(this.bmp) ;
	} , 

	update: function() {

	} ,

	remove: function() {
		gGameEngine.stage.removeChild(this.bmp) ;

        for (var i = 0 ; i < gameEngine.tiles.length ; i++)
        {
            var tile = gameEngine.tiles[i] ;
            if (this == tile)
                gameEngine.tiles.splice(i , 1) ;
        }
    }
}) ;