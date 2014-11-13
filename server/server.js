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
	
	// Start the game socket listening to port 8000
	socket = io.listen(8000);

	console.log('New Game Started');
	
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
	
	// Listen for client catcher
	client.on("catcher", onClientCatcher);
	
	// Listen for client update
	client.on("update player active", onPlayerActiveUpdate);
	
	
};

//
function onClientCatcher(player) {
	
	console.log('collision');
	
};

// Get Player Updates
function onPlayerActiveUpdate(data) {

	console.log('player sent update');
	//console.log(data);
	updatePlayer(data.id, data.isActive);
	
};

// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);
    var wasCatcher = false;

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	}
    else{
        wasCatcher = removePlayer.getIsCatcher();
    }

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});

    if(wasCatcher){
        var rand = Math.floor(Math.random()*players.length)
        if(rand) {
            var randId = players[rand].id;
            players[rand].setIsCatcher(true);
            console.log(randId);

            this.broadcast.emit("new Catcher", {id: randId});
        }
    }

};

// New player has joined
function onNewPlayer(data) {


    if(players.length <= 3) {

        // Create a new player
        var newPlayer = new Player(data.x, data.y);
        newPlayer.id = this.id;

        if (!catcherDefined()) {
            //here we set the first player to be the catcher
            newPlayer.setIsCatcher(true);
            this.emit("new Catcher", {id: newPlayer.id});
            console.log('First player set to Catcher ' + newPlayer.getIsCatcher());

            //reset players
            //players = [];
        }


        // Broadcast new player to connected socket clients
        this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), isCatcher: newPlayer.getIsCatcher()});

        // Send existing players to the new player
        var i, existingPlayer;
        for (i = 0; i < players.length; i++) {
            existingPlayer = players[i];
            this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), isCatcher: existingPlayer.getIsCatcher()});
            //console.log(existingPlayer.getIsCatcher() + ' id: ' + existingPlayer.id);
        }
        ;


        // Add new player to the players array
        players.push(newPlayer);
    }
};

// Player has moved
function onMovePlayer(data) {
	
	// Find player in array
	var movePlayer = playerById(this.id);

	
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



		//Check if game is over (moves are the only thing changing)
		if(countActive() == 1){
			this.broadcast.emit("game over", {msg: 'you lost!'});
			
			//Now also set the last player inactive
			console.log('last player set inactive');
			
			movePlayer.setIsCatcher(false);
			movePlayer.setIsActive(false);
			
			this.emit("game over", {msg: 'you won'});

		}
		else
		{
		// Broadcast updated position to connected socket clients
		this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
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

//Detecting a collision of any players
function collisionDetect() {

	if(DEBUG){
		console.log('Known Players on Server:');
		var h;
		for (h = 0;h < players.length; h++) {
				console.log(players[h].id);
		};
	}

	
var i;
var j;
	for (i = 0; i < players.length; i++) {
		if(DEBUG){
		
		console.log('------------Colision Detection Player 1------------' ); 
					console.log(' id: ' + players[i].id ); 
					console.log('X: ' + players[i].getX() + ' Y: ' + players[i].getY());
					console.log('Player active: ' + players[i].getIsActive());
					console.log('Player catcher: ' + players[i].getIsCatcher());					
					
		}
		for (j = 0; j < players.length ; j++) {
			
			if(DEBUG){

					console.log('-------------------Player 2----------------------------' );
					console.log('Player 2 id: ' + players[j].id);
					console.log('X: ' + players[j].getX() + ' Y: ' + players[j].getY());
					console.log('Player ACTIVE: ' + players[j].getIsActive()); 
					console.log('Player catcher: ' + players[j].getIsCatcher());
					console.log('-----------------------------------------------' );
					
				}
			
			
			if (checkCoordinates(players[i].getX(), players[i].getY(), players[j].getX(), players[j].getY()) 
				&& players[i].id != players[j].id
				&& players[i].getIsActive() 
				&& players[j].getIsActive()
				&&  (players[i].getIsCatcher() ||
					 players[j].getIsCatcher())){
				
				console.log('treffer!!');
				
				
				
				// Collision! hold your hats!
				if (!players[i].getIsCatcher())
				{
					players[i].setIsActive(false);
				}
				if (!players[j].getIsCatcher())
				{
					players[j].setIsActive(false);
				}



                srvMsg({ status : 1,
                    payload : 'test dcollision' });
				socket.emit("collision", {id1: players[i].id, id2: players[j].id});
				break;
			}
		};
	};

};


//Checking the coordinates of two players with a tolerance
function checkCoordinates(p1x, p1y, p2x, p2y) {
	
	var returnVal = false;
	var tol = 20; // tolerance for collision detection


	if (p1x < p2x + tol &&
	   p1x + tol > p2x &&
	   p1y < p2y + tol &&
	   tol + p1y > p2y) {
		// collision detected!
			returnVal = true;
	}
	
	return returnVal;
}

function countActive() {
	
	var countActive = 0;
	
	var h;
	for (h = 0;h < players.length; h++) {
			
			if(players[h].getIsActive())
			{
				countActive++;
			}
	};
	
	return countActive;
}

function catcherDefined() {
	
	var i;
	
	for (i = 0; i < players.length; i++) {
		if (players[i].getIsCatcher())
			return true;
	};
	return false;
}


function updatePlayer(id, active) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
		 players[i].setIsActive(active);
		 return true;
	};
	return false;
};

function srvMsg(data) {
    /*
    Message levels:
    1 = info
    2 = err
     */

    this.broadcast.emit("server message", {status: data.status, payload: data.text});
};


/**************************************************
** RUN THE GAME
**************************************************/
init();



