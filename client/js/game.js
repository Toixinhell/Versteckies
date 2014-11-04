/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	// Local player
	remotePlayers,	// Remote players
	socket,
	img;			// Socket connection
	
var DEBUG = true; 	//Are you shure?


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
	
	img = new Image();
  	img.src = 'images/shaq.png';
  	
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

	// Initialise the local player
	localPlayer = new Player(startX, startY, getRandomColor());

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
	var newPlayer = new Player(data.x, data.y, getRandomColor());
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

function onClientCollision(data){
	var colPlayer1 = playerById(data.id1);
	var colPlayer2 = playerById(data.id2);
	
	
	// Player not found
	if (!colPlayer1) {
		if(localPlayer.getIsActive()){
			localPlayer.setIsActive(false);
			colPlayer2.setIsActive(false);
		}
	}
	
	else if (!colPlayer2) {
		if(localPlayer.getIsActive()){
			localPlayer.setIsActive(false);
			colPlayer1.setIsActive(false);
		}
	}
	
	else
	{
		colPlayer1.setIsActive(false);
		colPlayer2.setIsActive(false);
	}
	
		
	//debugPlayers(data);
	
	//console.log('Player got collision: ' + test.getIsActive()); 
	
	
	html = writeCollisionHTML(data);
}

/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	// Update local player and check for change
	//console.log(localPlayer.getIsActive());
	if (localPlayer.update(keys) && localPlayer.getIsActive()) {
		// Send local player data to the game server
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
	};
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the local player
	localPlayer.draw(ctx);

	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx);
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

function debugPlayers(data){
	for (i = 0; i < remotePlayers.length; i++) {
		
			console.log(remotePlayers[i]);
		
		};
	console.log(localPlayer);
}