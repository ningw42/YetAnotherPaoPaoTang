Character = Entity.extend({

	bmp: null ,
	position: {} ,

	controls: {
        'up': 'up',
        'left': 'left',
        'down': 'down',
        'right': 'right',
        'bomb': 'bomb'
    },

    movingSpeed: 5 ,
    bombMax: 3 ,
    totalNumberOfBombs: 0,
    bombs: [] ,
    alive: true ,
    id: null,


    escape: null ,

    init: function(id, position , material, isLocal) {
        this.id = id;
    	var characterImg = gameEngine.characterJohnImg ;
        if (material == 'betty')
            characterImg = gameEngine.characterBettyImg ;
        else if (material == 'joe')
            characterImg = gameEngine.characterJoeImg ;
        else if (material == 'mary')
            characterImg = gameEngine.characterMaryImg ;

    	var spriteSheet = new createjs.SpriteSheet({
    		images: [characterImg] ,
    		frames: {width: 22 , height: 22 , regX: 0 , regY: 0} , 
    		animations: {
                idle: [1 , 1 , 'idle'] ,
    			down: [0 , 2 , 'down' , 0.3] ,
    			up: [3 , 5 , 'up' , 0.3] ,
    			right: [6 , 8 , 'right' , 0.3] ,
    			left: [9 , 11 , 'left' , 0.3] ,
    			dead: [12, 23 , 'dead' , 0.3]
    		}
    	}) ;

    	this.bmp = new createjs.Sprite(spriteSheet) ;
        // amplify the image
        this.bmp.scaleX = this.bmp.scaleY = gameEngine.scale ;

    	this.position = position ;
        console.log(position);
    	var pixel = Utils.convertToBitmapPosition(position) ;
        // fix image bias
    	this.bmp.x = pixel.x - 4;
    	this.bmp.y = pixel.y - 8;

        gameEngine.stage.addChild(this.bmp) ;
        if (isLocal)
            this.bombListener() ;
    } ,

    updateRemote: function (metadata) {
        if (!this.alive)
            return ;

        var pixel = Utils.convertToBitmapPosition(metadata.position) ;
        // fix image bias
        //this.bmp.x = pixel.x - 4;
        //this.bmp.y = pixel.y - 8;

        // animate
        if (metadata.bmpPosition.x > this.bmp.x) {
            this.animate('right') ;
        } else if (metadata.bmpPosition.x < this.bmp.x) {
            this.animate('left') ;
        } else if (metadata.bmpPosition.y > this.bmp.y) {
            this.animate('down') ;
        } else if (metadata.bmpPosition.y < this.bmp.y) {
            this.animate('up') ;
        } else {
            this.animate('idle') ;
        }

        this.bmp.x = metadata.bmpPosition.x;
        this.bmp.y = metadata.bmpPosition.y;

        // update position
        this.updateRemotePosition(metadata);
    },

    update: function(metadata) {
        if (!this.alive)
            return ;

        var position = {x: this.bmp.x , y: this.bmp.y} ;

        var dirX = 0 , dirY = 0 ;
        if (inputEngine.actions[this.controls.up])
        {
            this.animate('up') ;
            position.y -= this.movingSpeed ;
            dirY = -1 ;
        }
        else if (inputEngine.actions[this.controls.down])
        {
            this.animate('down') ;
            position.y += this.movingSpeed ;
            dirY = 1 ;
        }
        else if (inputEngine.actions[this.controls.left])
        {
            this.animate('left') ;
            position.x -= this.movingSpeed ;
            dirX = -1 ;
        }
        else if (inputEngine.actions[this.controls.right])
        {
            this.animate('right') ;
            position.x += this.movingSpeed ;
            dirX = 1 ;
        }
        else
            this.animate('idle') ;

        if (position.x != this.bmp.x || position.y != this.bmp.y)
        {
            if (!this.detectBomb(position))
            {
                if (this.detectWall(position))
                {
                    var cornerFix = this.getCornerFix(dirX, dirY) ;
                    if (cornerFix) 
                    {
                        var fixX = 0 ;
                        var fixY = 0 ;
                        if (dirX)
                            fixY = (cornerFix.y - this.bmp.y) > 0 ? 1 : -1 ;
                        else
                            fixX = (cornerFix.x - this.bmp.x) > 0 ? 1 : -1 ;

                        this.bmp.x += fixX * this.movingSpeed ;
                        this.bmp.y += fixY * this.movingSpeed ;
                        this.updatePosition() ;
                    }
                }
                else
                {
                    this.bmp.x = position.x ;
                    this.bmp.y = position.y ;
                    this.updatePosition() ;
                }
            }
        }

        if (this.detectFire())
            this.die() ;
     } ,

    // Something wrong here
    bombListener: function() {
        var handler = this ;
        console.log('add listener') ;
        console.log(handler);
        inputEngine.addListener(this.controls.bomb , function() {
            console.log("current bomb: " + gameEngine.localBombs.length) ;
            for (var i = 0 ; i < gameEngine.localBombs.length ; i++)
            {
                var bomb = gameEngine.localBombs[i] ;
                if (Utils.comparePositions(bomb.position , handler.position))
                    return ;
            }

            var unexplodedBombs = 0 ;
            for (var i = 0 ; i < handler.bombs.length ; i++)
            {
                if (!handler.bombs[i].exploded)
                    unexplodedBombs += 1 ;
            }
            //console.log("unexplodedBombs: " + unexplodedBombs) ;
            //console.log(unexplodedBombs < handler.bombMax) ;
            //console.log(handler.bombMax) ;

            // Something wrong here
            if (unexplodedBombs < handler.bombMax)
            {
                //console.log(handler);
                var bomb = new Bomb(handler, handler.totalNumberOfBombs) ;
                handler.bombs.push(bomb) ;
                gameEngine.localBombs.push(bomb) ;

                // add remove listener to new generated bomb
                bomb.setExplodeListener(function() {
                    // remove from character
                    Utils.removeFromArray(handler.bombs , bomb) ;
                }) ;

                gameEngine.socket.emit('add-bomb', {position:bomb.position, characterId:bomb.characterId, id:bomb.id});
                handler.totalNumberOfBombs = (handler.totalNumberOfBombs + 1) % handler.bombMax;
            }
        }) ;
    } ,

    // Need Check
    getCornerFix: function(dirX, dirY) {
        var edgeSize = 17 * gameEngine.scale ;
        var position = {} ;

        var pos1 = {x: this.position.x + dirY , y: this.position.y + dirX} ;
        var bmp1 = Utils.convertToBitmapPosition(pos1) ;

        var pos2 = {x: this.position.x - dirY , y: this.position.y - dirX} ;
        var bmp2 = Utils.convertToBitmapPosition(pos2) ; 

        if (gameEngine.getTileMaterial({x: this.position.x + dirX , y: this.position.y + dirY}) == 'grass')
            position = this.position ;
        else if (gameEngine.getTileMaterial(pos1) == 'grass' && Math.abs(this.bmp.y - bmp1.y) < edgeSize && Math.abs(this.bmp.x - bmp1.x) < edgeSize)
        {
            if (gameEngine.getTileMaterial({x: pos1.x + dirX , y: pos1.y + dirY}) == 'grass')
                position = pos1 ;
        }
        else if (gameEngine.getTileMaterial(pos2) == 'grass' && Math.abs(this.bmp.y - bmp2.y) < edgeSize && Math.abs(this.bmp.x - bmp2.x) < edgeSize)
        {
            if (gameEngine.getTileMaterial({x: pos2.x + dirX , y: pos2.y + dirY}) == 'grass')
                position = pos2 ;
        }

        if (position.x && gameEngine.getTileMaterial(position) == 'grass')
            return Utils.convertToBitmapPosition(position) ;
    },

    animate: function(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1)
            this.bmp.gotoAndPlay(animation) ;
    } ,

    detectWall: function(position) {
        var character = {} ;
        character.left = position.x ;
        character.top = position.y ;
        character.right = character.left + 22 * gameEngine.scale ;
        character.bottom = character.top + 22 * gameEngine.scale ;

        var tiles = gameEngine.tiles ;
        for (var i = 0 ; i < tiles.length ; i++)
        {
            var tPosition = tiles[i].position ;
            var tile = {} ;

            tile.left = tPosition.x * gameEngine.tilesSize + 10 ; 
            tile.top = tPosition.y * gameEngine.tilesSize + 5 ;
            tile.right = tile.left + gameEngine.tilesSize - 16 ;
            tile.bottom = tile.top + gameEngine.tilesSize - 17 ;

            if (Utils.intersectRect(character , tile))
                return true ;
        }

        return false ;
    } ,

    detectBomb: function(pixels) {
        var position = Utils.convertToEntityPosition(pixels) ;

        for (var i = 0 ; i < gameEngine.localBombs.length ; i++)
        {
            var bomb = gameEngine.localBombs[i] ;
            if (bomb.position.x == position.x && bomb.position.y == position.y)
            {
                if (this.escape) {
                    //console.log(this.escape);
                    return false;
                }
                else
                    return true ;
            }
        }

        if (this.escape)
            this.escape = null ;

        return false ;
    } ,

    detectFire: function() {
        var bombs = gameEngine.localBombs ;

        for (var i = 0 ; i < bombs.length ; i++)
        {
            var bomb = bombs[i] ;
            for (var j = 0 ; j < bomb.flames.length ; j++)
            {
                var flame = bomb.flames[j] ;
                if (bomb.exploded && flame.position.x == this.position.x && flame.position.y == this.position.y)
                    return true ;
            }
        }

        return false ;
    } ,

    updatePosition: function() {
        this.position = Utils.convertToEntityPosition(this.bmp) ;
        // TO-DO
        gameEngine.socket.emit('local-player-info-update', {position : this.position, bmpPosition : {x : this.bmp.x, y : this.bmp.y}});
    } ,

    updateRemotePosition: function (data) {
        this.position = data.position;
        this.bmp.x = data.bmpPosition.x;
        this.bmp.y = data.bmpPosition.y;
    },

    die: function() {
        this.alive = false ;
        this.animate('dead') ;
        this.fade() ;
    } ,

    fade: function() {
        var timer = 0 ;
        var bmp = this.bmp ;
        var fade = setInterval(function() {
            timer++;

            if (timer > 10)
                bmp.alpha -= 0.05 ;

            if (bmp.alpha <= 0)
                clearInterval(fade) ;

        }, 30) ;
    }
}) ;