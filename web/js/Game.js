GameEngine = Class.extend({

	stage: null ,
	fps: 50 ,
	scale: 1.5 ,

	characterJohnImg: null ,
	characterMaryImg: null ,
	characterJoeImg: null ,
	characterBettyImg: null ,
	bombImg: null ,
	flamesImg: null ,
	tilesImg: null ,

	tilesSize: 24 ,
	tilesX: 39 ,
	tilesY: 25 ,

	bombs: [] ,
	tiles: [] ,
	characters: [] ,

	socket: null ,

	init: function() {
        
	} ,

	load: function() {
		var socket = io.connect('/') ;
		this.socket = socket ;

		var canvas = document.getElementById('canvas') ;
		this.stage = new createjs.Stage(canvas) ;

		var queue = new createjs.LoadQueue() ;	

		var handler = this ;
		queue.addEventListener("complete", function() {
            handler.characterJohnImg = queue.getResult('john') ;
            handler.characterMaryImg = queue.getResult('mary') ;
            handler.characterJoeImg = queue.getResult('joe') ;
            handler.characterBettyImg = queue.getResult('betty') ;
            handler.bombImg = queue.getResult('bomb') ;
            handler.flamesImg = queue.getResult('flames') ;
            handler.tilesImg = queue.getResult('tiles') ;
            handler.setup() ;
        });		
		
		queue.loadManifest([
			{id: "john" , src: "image/char-john.png"} ,
			{id: "mary" , src: "image/char-mary.png"} ,
			{id: "joe" , src: "image/char-joe.png"} ,
			{id: "betty" , src: "image/char-betty.png"} ,
			{id: "bomb" , src: "image/bombs.png"} ,
			{id: "flames" , src: "image/flames.png"} ,
			{id: "tiles" , src: "image/tiles.png"}
		]) ;
	} ,

	setup: function() {
		inputEngine.setup() ;
		this.drawTiles() ;
		this.createCharacter() ;

		if (!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', gameEngine.update) ;
            createjs.Ticker.setFPS(this.fps) ;
        }
	} ,

	update: function() {
		for (var i = 0 ; i < gameEngine.bombs.length ; i++)
			gameEngine.bombs[i].update() ;

		for (var i = 0 ; i < gameEngine.characters.length ; i++)
			gameEngine.characters[i].update() ;

		gameEngine.stage.update() ;
	} ,

	drawTiles: function() {
		for (var i = 0 ; i < this.tilesX ; i++)
		{
			for (var j = 0 ; j < this.tilesY ; j++)
			{
				if (i == 0 || j == 0 || i == this.tilesX - 1 || j == this.tilesY - 1)
				{
					var tile = new Tile('block' , {x: i , y: j}) ;
					this.tiles.push(tile) ;
				}
				else if ((i + 1) % 2 != 0 && (j + 1) % 2 != 0)
				{
					var tile = new Tile('block' , {x: i , y: j}) ;
					this.tiles.push(tile) ;
				}
				else
					var tile = new Tile('grass' , {x: i , y: j}) ;
			}
		}
	} ,

	getTile: function(position) {
		for (var i = 0 ; i < this.tiles.length ; i++)
		{
			var tile = this.tiles[i] ;
			if (tile.position.x == position.x && tile.position.y == position.y)
				return tile ;
		}
	} ,

	getTileMaterial: function(position) {
		var tile = this.getTile(position) ;

		return tile ? tile.material : 'grass' ;
	} ,

	getCharacters: function() {
		var characters = [] ;

        for (var i = 0 ; i < gameEngine.characters.length ; i++)
            characters.push(gameEngine.characters[i]) ;

        return characters ;
	} ,

	createCharacter: function() {
		var character = new Character('john' , {x: 1 , y: 1}) ;
		this.characters.push(character) ;

		controls = {
			'up': 'up2' ,
			'left': 'left2' ,
			'right': 'right2' ,
			'down': 'down2' ,
			'bomb': 'bomb2'
		}
		var character2 = new Character('betty' , {x: 37 , y: 23} , controls) ;
		this.characters.push(character2) ;
	} 

}) ;

gameEngine = new GameEngine() ;
$(document).ready(function(){
	gameEngine.load() ;
}) ;