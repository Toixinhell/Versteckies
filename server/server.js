/**
 * This is the Server class, responsible for handling client connections.
 *
 * This class can be seen as the main one. It initialises the basic socket.io connections,
 * all connected players and the actual games. The players can connect as long as the game is not full.
 *
 * TODO: Implement the possibility for more than one game at a time.
 *
 * @category   ServerSide
 * @author     Lukas Stahel
 * @author     Stefan Bacoks
 * @license    THE BEER-WARE LICENSE (Revision 42)
 */

// Node.js requirements
var util = require("util");
var io = require("socket.io");

// Class dependencies
Player = require("./Player").Player;	// Player class
Game = require("./Game").Game;            // Game class

// Server variables
var socket;	// Socket controller
var DEBUG = false; 	//Are you shure?

/**
 *
 * Initiate the server and start waiting for players
 *
 * @param    object  $object The object to convert
 * @return      array
 *
 */
function init() {
    // all games will be in the array
    games = [];

    // Start the game socket listening to port 8000
    socket = io.listen(8000);

    // Create one MOCK game to simulate
    var game1 = new Game(socket);

    game1.id = 1;
    game1.initGame(socket);

    // Adding the MOCK game to the array of games
    games.push(game1);

    console.log('New Game Started');
};

// Run the server
init();



