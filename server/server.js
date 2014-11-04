/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io");				// Socket.IO
	Player = require("./Player").Player;	// Player class


/**************************************************
** GAME VARIABLES
**************************************************/
var socket,		// Socket controller
	players;	// Array of connected players

/**************************************************
** VARIABLES STRAIGHT FROM HELL
**************************************************/
var DEBUG = false; 	//Are you shure?	
	
/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Create an empty array to store players
	players = [];
	socket = io.listen(8000);
	
	//socket.set("transports", ["websocket"]);
	
	console.log('new Game Start');
	
	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Socket.IO
	console.log('new Connection established');
	socket.sockets.on("connection", onSocketConnection );
	//console.log(socket);
};

// New socket connection
function onSocketConnection(client) {
	console.log('Setting Handlers');
	console.log("New player has connected: "+client.id);

	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("new player", onNewPlayer);

	// Listen for move player message
	client.on("move player", onMovePlayer);
	
	// Listen for client collision
	//client.on("collision", onClientCollision);
	
};
/*
// Socket client has disconnected
function onClientCollision() {
	
	console.log('collision');
	
};
*/


// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});
};

// New player has joined
function onNewPlayer(data) {
	// Create a new player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = this.id;

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
	};

	
	// Add new player to the players array
	players.push(newPlayer);
};

// Player has moved
function onMovePlayer(data) {
	
	// Find player in array
	var movePlayer = playerById(this.id);

	if(movePlayer.getIsActive())
	{
		// Player not found
		if (!movePlayer) {
			util.log("Player not found: "+this.id);
			return;
		};

		// Update player position
		movePlayer.setX(data.x);
		movePlayer.setY(data.y);

		//Check for collision
		collisionDetect();
		
		// Broadcast updated position to connected socket clients
		this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
	}
	else
	{
		this.emit("server message", {status: 1, msg: 'You are dead mate!'});
	}
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	
	return false;
};

function collisionDetect() {

var i;
var j;
	for (i = 0; i < players.length; i++) {
		for (j = 0; j < players.length ; j++) {
			
			if (checkCoordinates(players[i].getX(), players[i].getY(), players[j].getX(), players[j].getY()) 
				&& players[i].id != players[j].id
				&& players[i].getIsActive() 
				&& players[j].getIsActive()){
				
				console.log('treffer!!');
				
				if(DEBUG){

					console.log('------------Colision Detection-----------------' ); 
					console.log('Player: ' + players[i].id ); 
					console.log('X: ' + players[i].getX() + ' Y: ' + players[i].getY());
					console.log('Player: ' + players[i].getIsActive()); 
					
					console.log('Player: ' + players[j].id);
					console.log('X: ' + players[j].getX() + ' Y: ' + players[j].getY());
					console.log('Player: ' + players[j].getIsActive()); 
					console.log('-----------------------------------------------' );
					
				}
				
				// Collision! hold your hats!
				players[i].setIsActive(false);
				players[j].setIsActive(false);
				
				socket.emit("collision", {id1: players[j].id, id2: players[i].id});
				break;
			}
		};
	};

};


function checkCoordinates(p1x, p1y, p2x, p2y) {
	
	var returnVal = false;
	var tol = 20; // toleranz for collision detection


	if (p1x < p2x + tol &&
	   p1x + tol > p2x &&
	   p1y < p2y + tol &&
	   tol + p1y > p2y) {
		// collision detected!
			returnVal = true;
	}
	
	return returnVal;
}

/**************************************************
** RUN THE GAME
**************************************************/
init();



