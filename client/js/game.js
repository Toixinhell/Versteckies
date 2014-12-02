/**
 * Our Game, the beating heart on the Clients side, it provides us with logic
 * and will eventually throw errors now and then
 *
 * @category   ClientSide
 * @author     Stefan Bakocs, Lukas Stahel
 * @license    THE BEER-WARE LICENSE (Revision 42)
 */
 
// Canvas DOM element
var canvas;
// Canvas rendering context
var ctx;
// Keyboard input
var keys;
// Local player
var localPlayer;
// Remote players
var remotePlayers;
// The socket connection
var socket;
// The player image
var imgPlayer;
var imgCatcher;			

/**
 *
 * Game Initialisation
 * Builds up canvas and shows us fancy field of battle
 *
 */
function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
	
	imgPlayer = new Image();
  	imgPlayer.src = 'images/ghost.gif';
	
	imgCatcher = new Image();
  	imgCatcher.src = 'images/shaq.png';
  	
	// Maximise the canvas
	canvas.width = 800//window.innerWidth;
	canvas.height = 600//window.innerHeight;
	
	// Initialise keyboard controls
	keys = new Keys();
	
	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width-5));
	var startY = Math.round(Math.random()*(canvas.height-5));
	
	if(startX%2!=0){
		startX += 1;
	}
	
	if(startY%2!=0){
		startY += 1;
	}
	
	// Initialise the local player (catcher is default: false)
	localPlayer = new Player(startX, startY, getRandomColor(), false);
	
	// Initialise socket connection
	socket = io.connect("http://192.168.2.200:8000");
	
	// Initialise remote players array
	remotePlayers = [];
	
	// Start listening for events
	setEventHandlers();
};

function reInit(theme) {
	switch(theme){
		case 'atari':
		playerSrc='images/space invader.png';
		catcherSrc='images/ship.png';
		break;
		default:
		case 'nintendo':
		playerSrc='8-bit_himiko.png';
		catcherSrc='8bit-mushroom-png';
		break;
	}
	imgPlayer = new Image();
  	imgPlayer.src = playerSrc;
	imgCatcher = new Image();
  	imgCatcher.src = imgCatcher;
}

/**
 *
 * This function sets our eventhandlers
 *
 */
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);
	
	// Socket connection successful
	socket.on("connect", onSocketConnected);
	
	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);
	
	// New player message received
	socket.on("new player", onNewPlayer);
	
	// Player move message received
	socket.on("move player", onMovePlayer);
	
	// Player removed message received
	socket.on("remove player", onRemovePlayer);

	// Player collided
	socket.on("collision", onClientCollision);
	
	// Player catcher
	socket.on("new catcher", onNewCatcher);

	// game over
	socket.on("game over", onGameOver);

	// server message
	socket.on("server message", onServerMessage);
	
	// server message
	socket.on("game ready", onGameReady);
};

/**
 *
 * Gets called if key is pressed down
 *
 */
function onKeydown(e) {
	if (localPlayer) {
		jQuery('#tick').get(0).play();
		keys.onKeyDown(e);
	};
};

/**
 *
 * Gets called if key is released
 *
 */
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

/**
 *
 * Handles gameover state
 *
 */
function onGameOver(gameData) {
	
	if(gameData.msg == 'you won')
	{
		localPlayer.setIsActive(false);
		//localPlayer.setIsCatcher(false);
		drawWinnerNotice();
	}else if(gameData.msg == 'you lost!'){
		drawLooserNotice();
	}
	
	console.log('Game over:' + gameData.msg);
	//location.reload(); 
};

/**
 *
 * When we connect to the Server
 *
 */
function onSocketConnected() {
	console.log("Connected to socket server");
	
	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

/**
 *
 * When a player disconnects
 *
 */
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

/**
 *
 * When a new player connects
 *
 */
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);
	
	// Initialise the new player
	var newPlayer = new Player(data.x, data.y, getRandomColor(), data.isCatcher);
	newPlayer.id = data.id;
	
	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

/**
 *
 * When a other player moves
 *
 */
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);
	
	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};
	
	// Update player position
		movePlayer.setX(data.x);
		movePlayer.setY(data.y);
};

/**
 *
 * If a player (for whatever reasons e.g. disconnects, ragequits) gets removed
 *
 */
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);
	
	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};
	
	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

/**
 *
 * If the current catcher gets disconnected we have to set a new catcher
 *
 */
function onNewCatcher(data){

    if(!playerById(data.id)){
        localPlayer.setIsCatcher(true);
        localPlayer.setIsActive(true);
        console.log('localPlayer set to catcher');
    }else{

        var i;
        for (i = 0; i < remotePlayers.length; i++) {
            if (remotePlayers[i].id == data.id) {
                remotePlayers[i].setIsCatcher(true);
                console.log('remotePlayer ' + data.id + ' set to catcher');
            }
        };
    }

    console.log(remotePlayers);

}

/**
 *
 * Serve can send us a message, here we receive it
 *
 */
function onServerMessage(data){
	writeServerInfo(data);
}

/**
 *
 * Serve can send us a message, here we receive it
 *
 */
function onGameReady(){
	animate(); 
	clearInterval(interval);
	jQuery('#gameCanvas').fadeIn();
	jQuery('#welcome').hide();
}

/**
 *
 * Oh my ... a player collided, take action!
 *
 */
function onClientCollision(data){
	var colPlayer1 = playerById(data.id1);
	var colPlayer2 = playerById(data.id2);
	

	//Update Remote Players
	// Player 1 may be localPlayer not found
	if (!colPlayer1) {
		console.log('colPlayer1 is null, has to be localPlayer');
		if(localPlayer.getIsActive()){
			console.log('localPlayer is active');
			
			if (localPlayer.getIsCatcher())
			{	
				console.log('localPlayer is Catcher');
				updateRemotePlayerActive(colPlayer2.id, false);
				//socket.emit("update player active", {id: colPlayer2.id, isActive: colPlayer2.getIsActive()});
				
			}
			
			else
			{	
				console.log('localPlayer is not catcher');
				localPlayer.setIsActive(false);
				socket.emit("update player active", {id: localPlayer.id, isActive: localPlayer.getIsActive()});
				
			}
			
			
			
		}
	} else if (!colPlayer2) {
	
	// Player 2 may be localPlayer not found
		console.log('colPlayer2 is null, has to be localPlayer');
		
		if(localPlayer.getIsActive()){
			console.log('localPlayer is active');
			
			if (localPlayer.getIsCatcher())
			{
				console.log('localPlayer is catcher');
				updateRemotePlayerActive(colPlayer1.id, false);				
			}
			else
			{
				console.log('localPlayer is not catcher');
				localPlayer.setIsActive(false);
				socket.emit("update player active", {id: localPlayer.id, isActive: localPlayer.getIsActive()});
				
			}
		}
		
	} else {
		console.log('localPlayer is NOT involved, so set both inactive');
		if (colPlayer1.getIsCatcher())
		{
			updateRemotePlayerActive(colPlayer2.id, false);
		}
		else if (colPlayer2.getIsCatcher())
		{
			updateRemotePlayerActive(colPlayer1.id, false);
		}
		
		console.log('1: ' + colPlayer1.getIsActive());
		console.log('2: ' + colPlayer2.getIsActive());
		
	}
	
	html = writeCollisionHTML(data);
}

/**
 *
 * Each refresh, passes through here, this will initiate redrawing of our canvas
 *
 */
function animate() {
	
	
	//Only update() position of localPlayer if he is still active!
	
	if(localPlayer.getIsActive()){
		update();
	}
	
	draw();
	
	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};

/**
 *
 * Each time a player has moved, we have to update its position
 *
 */
function update() {
	var x = localPlayer.getX();
	var y = localPlayer.getY();
	
	// Update local player and check for change
	if (localPlayer.update(keys)) {
		// Send local player data to the game server
		socket.emit("move player", {x: x, y: y});
	};
};

/**
 *
 * Draw our player to the canvas
 *
 */
function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (localPlayer.getIsCatcher())
	{
		// Draw the local player
		localPlayer.drawCatcher(ctx);
	}
	else
	{
		// Draw the local player
		localPlayer.draw(ctx);
	}
	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].getIsCatcher())
		{
			// Draw the local player
			remotePlayers[i].drawCatcher(ctx);
		}
		else
		{
			// Draw the local player
			remotePlayers[i].draw(ctx);
		}
		
	};
};

/**
 *
 * Get a player by his ID
 *
 */
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	
	return false;
};

/**
 *
 * Sets the state of the other players because sometimes
 * we're running into situations where we have to keep the game running allthough
 * the user is probably dead
 *
 */
function updateRemotePlayerActive(id, active) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			remotePlayers[i].setIsActive(active);
		return true;
	};
	return false;
};

/**
 *
 * Debug Function, poorly maintained
 *
 */
function debugPlayers(data){
	for (i = 0; i < remotePlayers.length; i++) {
		
		console.log(remotePlayers[i]);
		
	};
	console.log(localPlayer);
}