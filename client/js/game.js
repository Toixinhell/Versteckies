/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
ctx,			// Canvas rendering context
keys,			// Keyboard input
localPlayer,	// Local player
remotePlayers,	// Remote players
socket,
img;			// The player image

var DEBUG = true; 	//Are you shure?


/**************************************************
** GAME INITIALISATION
**************************************************/
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
	
	// give the canvas a boarder
	canvas.style.border = "red 1px solid";
	
	// Initialise keyboard controls
	keys = new Keys();
	
	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width-5)),
	startY = Math.round(Math.random()*(canvas.height-5));
	
	// Initialise the local player (catcher is default: false)
	localPlayer = new Player(startX, startY, getRandomColor(), false);
	
	// Initialise socket connection
	socket = io.connect("http://localhost:8000");
	
	// Initialise remote players array
	remotePlayers = [];
	
	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);
	
	// Window resize
	window.addEventListener("resize", onResize, false);
	
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
	socket.on("catcher", onClientCatcher);
	
	
	// Player catcher
	socket.on("game over", onGameOver);
};

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

//Game over
function onGameOver(gameData) {
	
	if(gameData.msg == 'you won')
	{
		localPlayer.setIsActive(false);
		localPlayer.setIsCatcher(false);
		alert("You're winner");
	}else if(gameData.msg == 'you lost!'){
		alert("THE GAME");
	}
	
	console.log('Game over:' + gameData.msg);
	location.reload(); 
};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");
	
	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);
	
	// Initialise the new player
	var newPlayer = new Player(data.x, data.y, getRandomColor(), data.isCatcher);
	newPlayer.id = data.id;
	
	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
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

// Remove player
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
function onClientCatcher(data){
	
	localPlayer.setIsCatcher(data);
	console.log('localPlayer set to catcher');
}



function onClientCollision(data){
	var colPlayer1 = playerById(data.id1);
	var colPlayer2 = playerById(data.id2);
	
	
	if (DEBUG){
		
		console.log('Server sent a collision');
		console.log('colider1 id: ' + colPlayer1.id);
		console.log('colider2 id: ' + colPlayer2.id);
		
	}
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
	}
	// Player 2 may be localPlayer not found
	else if (!colPlayer2) {
		console.log('colPlayer2 is null, has to be localPlayer');
		
		if(localPlayer.getIsActive()){
			console.log('localPlayer is active');
			
			if (localPlayer.getIsCatcher())
			{
				console.log('localPlayer is catcher');
				updateRemotePlayerActive(colPlayer1.id, false);
				//socket.emit("update player active", {id: colPlayer1.id, isActive: colPlayer1.getIsActive()});
				
			}
			else
			{
				console.log('localPlayer is not catcher');
				localPlayer.setIsActive(false);
				socket.emit("update player active", {id: localPlayer.id, isActive: localPlayer.getIsActive()});
				
			}
		}
		
	}
	
	else
	{
		console.log('localPlayer is NOT involved, so set both inactive');
		if (colPlayer1.getIsCatcher())
		{
			updateRemotePlayerActive(colPlayer2.id, false);
			//socket.emit("update player active", {id: colPlayer2.id, isActive: colPlayer2.getIsActive()});
		}
		else if (colPlayer2.getIsCatcher())
		{
			updateRemotePlayerActive(colPlayer1.id, false);
			//socket.emit("update player active", {id: colPlayer1.id, isActive: colPlayer1.getIsActive()});
		}
		
		console.log('1: ' + colPlayer1.getIsActive());
		console.log('2: ' + colPlayer2.getIsActive());
		
	}
	
	html = writeCollisionHTML(data);
}

/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	
	//console.log('localplayer is catcher:' + localPlayer.getIsCatcher());
	//console.log('localplayer is catcher:' + localPlayer.getIsActive());
	
	
	//Only update() position of localPlayer if he is still active!
	
	if(localPlayer.getIsActive()){
		update();
	}
	
	draw();
	
	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	var x = localPlayer.getX();
	var y = localPlayer.getY();
	
	//console.log(x,y);
	
	// Update local player and check for change
	if (localPlayer.update(keys)) {
		// Send local player data to the game server
		socket.emit("move player", {x: x, y: y});
	};
};


/**************************************************
** GAME DRAW
**************************************************/
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


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	
	return false;
};

function updateRemotePlayerActive(id, active) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			remotePlayers[i].setIsActive(active);
		return true;
	};
	return false;
};


function debugPlayers(data){
	for (i = 0; i < remotePlayers.length; i++) {
		
		console.log(remotePlayers[i]);
		
	};
	console.log(localPlayer);
}