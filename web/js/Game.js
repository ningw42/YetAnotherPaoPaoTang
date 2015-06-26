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

	materials: ['john', 'betty', 'joe', 'mary'],

	tilesSize: 24 ,
	tilesX: 39 , // number of tiles horizontal
	tilesY: 25 , // number of tiles vertical

	bombs: [] ,
	tiles: [] ,
	remoteCharacters: [] ,
	localCharacter: null ,

	numberOfPlayers: 0 ,

	socket: null ,

	init: function() {
        
	} ,

	loadCurrentScene: function () {

		// load all player
		var scene = this;
		this.socket.emit('demand-on-players-list');
		this.socket.on('send-character-detail', function (data) {
			console.log('Players : ' + data.id + ' ,' + data.position);
			scene.createRemoteCharacter(data.id, data.position, data.material);
		});
		// some mistakes here better using block IO
		this.socket.emit('remote-players-done');

		this.socket.on('starting-load-local-player', function (data) {
			scene.createLocalCharacter(data.nextPlayersID);
		});
	},

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
		this.loadCurrentScene();

		// polling for update
        //if (!createjs.Ticker.hasEventListener('tick')) {
        //    createjs.Ticker.addEventListener('tick', gameEngine.update) ;
        //    createjs.Ticker.setFPS(this.fps) ;
        //}
	} ,

	update: function(data) {
		//for (var i = 0 ; i < gameEngine.bombs.length ; i++)
		//	gameEngine.bombs[i].update() ;

		var chars = data.characters;
		var localChar = null;

		// find update data for localChar and delete it from data stream
		if (this.localCharacter) {
			for (var i = 0; i < chars.length; i++) {
				if (this.localCharacter.id == chars[i].id) {
					localChar = chars[i];
					chars = chars.splice(i, 1);
					break;
				}
			}
			// update localChar
			gameEngine.localCharacter.update(localChar);
		}

		// find remote Char's data and update
		if (gameEngine.remoteCharacters.length > 0) {
			for (var i = 0; i < gameEngine.remoteCharacters.length; i++) {
				for (var j = 0; j < chars.length; j++) {
					if (gameEngine.remoteCharacters[i].id == chars[j].id) {
						gameEngine.remoteCharacters[i].updateRemove(chars[j]);
						break;
					}
				}
			}
		}

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
					var tile = new Tile('grass' , {x: i , y: j}) ;
					this.tiles.push(tile) ;
				}
				else
				{
					var tile = new Tile('grass', {x: i, y: j});
				}
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
		// NOTE doest contains the localCharacter
		var characters = [] ;

        for (var i = 0 ; i < gameEngine.remoteCharacters.length ; i++)
            characters.push(gameEngine.remoteCharacters[i]) ;

        return characters ;
	} ,

	insertNewCharacter: function (id, position, material) {
		var character = new Character(id, position, material);
		this.remoteCharacters.push(character);
		this.numberOfPlayers++;
	},

	createLocalCharacter: function(id) {
		// TO-DO find a position to add a new player
		var position = {x: Math.floor(Math.random() * 39) , y: Math.floor(Math.random() * 25)} ;
		var material = this.materials[Math.floor(Math.random() * 4)];
		this.localCharacter = new Character(id, material, position) ;
		this.socket.emit('add-player', {id : id, initPosition : position, material: material});
		this.numberOfPlayers++;
		//this.remoteCharacters.push(this.localCharacter) ;
	},

	createRemoteCharacter: function(id, position, material) {
		var character = new Character(id, position, material) ;
		this.numberOfPlayers++;
		this.remoteCharacters.push(character) ;
	},

	removeCharacterById: function (id) {
		for (var i = 0; i < this.remoteCharacters.length; i++) {
			if (this.remoteCharacters[i].id === id) {
				this.remoteCharacters[i].die();
				this.remoteCharacters.splice(i, 1);
				this.numberOfPlayers--;
				break;
			}
		}
	}

}) ;

gameEngine = new GameEngine() ;
$(document).ready(function(){
	gameEngine.load() ;
})