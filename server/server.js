/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io");				// Socket.IO
	Player = require("./Player").Player;	// Player class
    Game = require("./Game").Game;            // Game class

/**************************************************
** GAME VARIABLES
**************************************************/
var socket;		// Socket controller

/**************************************************
** VARIABLES STRAIGHT FROM HELL
**************************************************/
var DEBUG = false; 	//Are you shure?
	
/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
    // Create an empty array to store games
    games = [];

// Start the game socket listening to port 8000
    socket = io.listen(8000);

    var game1 = new Game(socket);
    game1.id = 1;
    game1.initGame(socket);

    games.push(game1);

    console.log(game1);





	console.log('New Game Started');

};





/**************************************************
** RUN THE GAME
**************************************************/
init();



