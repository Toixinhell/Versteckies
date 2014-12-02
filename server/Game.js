/**
 * This is the Game class, responsible for handling all of the serverside game logic.
 *
 * This class represents the game. It handles all logic that the server has to keep track of.
 * Here we check if players are still connected or collided.. Also the handlers are set here,
 * to keep them from interfering with other games. All players are sent the positions of the other players.
 *
 * TODO: Implement the possibility for more than one game at a time.
 * TODO: Implement the gameID in all necessary functions, so the server can handle multiple games.
 *
 * @category   ServerSide
 * @author     Lukas Stahel
 * @author     Stefan Bacoks
 * @license    THE BEER-WARE LICENSE (Revision 42)
 */

// Utility resources (logging, object inspection, etc)
var util = require("util");
var io = require("socket.io");

// Class dependencies
Player = require("./Player").Player;

// The debug variable
var DEBUG = false; 	//Are you shure?


/**
 *
 * The game class is initialized with the socket
 *
 * @param    socket, the socket responsible for the connections to the game
 *
 */
var Game = function (socket) {

    //Game class variables
    var gameSocket = socket;
    var id;
    var isFull = false;
    var started = false;
    var players = [];


    /**
     *
     * Initialize a new game, by setting all the event handlers
     *
     */
    function initGame() {
        // Create an empty array to store players
        setEventHandlers();

    }

    /**
     *
     * Initialize the Eventhandlers when a player connects
     *
     */
    var setEventHandlers = function () {

        // gameSocket.IO
        console.log('new Connection established');
        gameSocket.sockets.on("connection", onSocketConnection);

    };

    /**
     *
     * Ta new game has been created
     *
     * @param    socket, the socket responsible for the connections to the game
     *
     */
    function onSocketConnection(client) {
        console.log('Setting Handlers');
        console.log("New player has connected: " + client.id);

        // Listen for client disconnected
        client.on("disconnect", onClientDisconnect);

        // Listen for new player message
        client.on("new player", onNewPlayer);

        // Listen for move player message
        client.on("move player", onMovePlayer);

        // Listen for client update
        client.on("update player active", onPlayerActiveUpdate);


    };


// Get Player Updates
    function onPlayerActiveUpdate(data) {

        console.log('player sent update');
        //console.log(data);
        updatePlayer(data.id, data.isActive);

    };

// gameSocket client has disconnected
    function onClientDisconnect() {
        util.log("Player has disconnected: " + this.id);

        var removePlayer = playerById(this.id);
        var wasCatcher = false;

        // Player not found
        if (!removePlayer) {
            util.log("Player not found: " + this.id);

        }
        else {
            wasCatcher = removePlayer.getIsCatcher();
        }

        // Remove player from players array
        players.splice(players.indexOf(removePlayer), 1);

        // Broadcast removed player to connected gameSocket clients
        this.broadcast.emit("remove player", {id: this.id});

        if (wasCatcher) {
            var rand = Math.floor(Math.random() * players.length)
            if (rand) {
                var randId = players[rand].id;
                players[rand].setIsCatcher(true);
                console.log(randId);

                this.broadcast.emit("new catcher", {id: randId});
            }
        }

    };

// New player has joined
    function onNewPlayer(data) {


        if (players.length <= 3) {

            // Create a new player
            var newPlayer = new Player(data.x, data.y);
            newPlayer.id = this.id;

            if (!catcherDefined()) {
                //here we set the first player to be the catcher
                newPlayer.setIsCatcher(true);
                this.emit("new catcher", {id: newPlayer.id});
                console.log('First player set to Catcher ' + newPlayer.getIsCatcher());

                //reset players
                //players = [];
            }


            // Broadcast new player to connected gameSocket clients
            this.broadcast.emit("new player", {
                    id: newPlayer.id,
                    x: newPlayer.getX(),
                    y: newPlayer.getY(),
                    isCatcher: newPlayer.getIsCatcher()}
            );

            // Send existing players to the new player
            var i, existingPlayer;
            for (i = 0; i < players.length; i++) {
                existingPlayer = players[i];
                this.emit("new player", {
                    id: existingPlayer.id,
                    x: existingPlayer.getX(),
                    y: existingPlayer.getY(),
                    isCatcher: existingPlayer.getIsCatcher()
                });
                //console.log(existingPlayer.getIsCatcher() + ' id: ' + existingPlayer.id);
            }
            ;


            // Add new player to the players array
            players.push(newPlayer);
        }

        else {

        }
    };

// Player has moved
    function onMovePlayer(data) {

        // Find player in array
        var movePlayer = playerById(this.id);


        // Player not found
        if (!movePlayer) {
            util.log("Player not found: " + this.id);
            return;
        }
        ;

        // Update player position
        movePlayer.setX(data.x);
        movePlayer.setY(data.y);

        //Check for collision
        collisionDetect();


        //Check if game is over (moves are the only thing changing)
        if (countActive() == 1) {
            this.broadcast.emit("game over", {msg: 'you lost!'});

            //Now also set the last player inactive
            console.log('last player set inactive');

            movePlayer.setIsCatcher(false);
            movePlayer.setIsActive(false);

            this.emit("game over", {msg: 'you won'});

        }
        else {
            // Broadcast updated position to connected gameSocket clients
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
        }
        ;

        return false;
    };


    function hitDetection(i, j) {
        return checkCoordinates(players[i].getX(), players[i].getY(), players[j].getX(), players[j].getY())
            && players[i].id != players[j].id
            && players[i].getIsActive()
            && players[j].getIsActive()
            && (players[i].getIsCatcher() ||
                players[j].getIsCatcher());
    }

//Detecting a collision of any players
    function collisionDetect() {

        if (DEBUG) {
            console.log('Known Players on Server:');
            var h;
            for (h = 0; h < players.length; h++) {
                console.log(players[h].id);
            }
            ;
        }


        var i;
        var j;
        for (i = 0; i < players.length; i++) {
            if (DEBUG) {

                console.log('------------Colision Detection Player 1------------');
                console.log(' id: ' + players[i].id);
                console.log('X: ' + players[i].getX() + ' Y: ' + players[i].getY());
                console.log('Player active: ' + players[i].getIsActive());
                console.log('Player catcher: ' + players[i].getIsCatcher());

            }
            for (j = 0; j < players.length; j++) {

                if (DEBUG) {

                    console.log('-------------------Player 2----------------------------');
                    console.log('Player 2 id: ' + players[j].id);
                    console.log('X: ' + players[j].getX() + ' Y: ' + players[j].getY());
                    console.log('Player ACTIVE: ' + players[j].getIsActive());
                    console.log('Player catcher: ' + players[j].getIsCatcher());
                    console.log('-----------------------------------------------');

                }


                if (hitDetection(i, j)) {

                    console.log('treffer!!');


                    // Collision! hold your hats!
                    if (!players[i].getIsCatcher()) {
                        players[i].setIsActive(false);
                    }
                    if (!players[j].getIsCatcher()) {
                        players[j].setIsActive(false);
                    }


                    srvMsg({ status: 2, payload: 'test collision' });
                    gameSocket.emit("collision", {id1: players[i].id, id2: players[j].id});
                    break;
                }
            }
            ;
        }
        ;

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
        for (h = 0; h < players.length; h++) {

            if (players[h].getIsActive()) {
                countActive++;
            }
        }
        ;

        return countActive;
    }

    function catcherDefined() {

        var i;

        for (i = 0; i < players.length; i++) {
            if (players[i].getIsCatcher())
                return true;
        }
        ;
        return false;
    }


    function updatePlayer(id, active) {
        var i;
        for (i = 0; i < players.length; i++) {
            if (players[i].id == id)
                players[i].setIsActive(active);
            return true;
        }
        ;
        return false;
    };

    function srvMsg(data) {
        /*
         Message levels:
         1 = info
         2 = err
         */
        console.log(data);
        gameSocket.emit("server message", {status: data.status, payload: data.payload});
    };


    // Define which variables and methods can be accessed
    return {
        id: id,
        initGame: initGame
    }


};

// Export the Game class so you can use it in
// other files by using require("Game").Game
exports.Game = Game;

