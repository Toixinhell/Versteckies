/**
 * This is the Server class, responsible for handling client connections.
 *
 * This class can be seen as the main one. It initialises the basic socket.io connections,
 * all connected players and the actual games. The players can connect as long as the game is not full.
 *
 * TODO: Implement the possibility for more than one game at a time.
 *
 * @category   ServerSide
 * @author     Lukas Stahel, Stefan Bakocs
 * @license    THE BEER-WARE LICENSE (Revision 42)
 */

// Node.js requirements
var util = require("util");
var io = require("socket.io");

// Class dependencies
Player = require("./Player").Player;
Game = require("./Game").Game;

// Server variables
var socket;
var DEBUG = false;

/**
 *
 * Initiates the server and starts waiting for players.
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
    game1.initGame();

    // Adding the MOCK game to the array of games
    games.push(game1);

    console.log('New Game Started');
};

// Run the server
init();



