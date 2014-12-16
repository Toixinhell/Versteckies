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
 * @author     Lukas Stahel, Stefan Bakocs
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
     * This function sets our eventhandlers
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

    /**
     *
     * This function updates the players[] setting the player inactive
     *
     */
    function onPlayerActiveUpdate(data) {

        console.log('player sent update');
        //console.log(data);
        updatePlayer(data.id, data.isActive);

    };

    /**
     *
     * This handles disconnecting players and sends an update to all the remaining ones
     *
     */
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

    /**
     *
     * This function handles new player connections
     *
     * * @param    data, represents all information recieved from the player
     *                data.x, the x-axis position of the player
     *                data.y, the y-axis position of the player
     *
     *
     */
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
            }
            ;

            // Add new player to the players array
            players.push(newPlayer);
        }

        else {
                /*TODO: Implement message to server that the game is full
                        or find a better soution
                 */

        }
    };

    /**
     *
     * This function player movement.
     * it also checks for collisions and checks if there are still enough players connected
     *
     * * @param    data, represents all information recieved from the player
     *                data.x, the x-axis position of the player
     *                data.y, the y-axis position of the player
     */
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

            //The game is over
            srvMsg({ status: 2, payload: 'game over' });


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


    /**
     *
     * This function finds players by their ID and returns an player object
     *
     * * @param    id, represents id of the player to be returned
     *   @return   player object
     */
    function playerById(id) {
        var i;
        for (i = 0; i < players.length; i++) {
            if (players[i].id == id)
                return players[i];
        }
        ;

        return false;
    };

    /**
     *
     * This function checks if two players have collided
     *
     * THIS FUNCTION WAS EXCLUDED FOR HOPE OF BETTER ALGORITHM
     *
     * * @param    i, represents index first level iteration
     * * @param    j, represents index second level iteration
     *
     */
    function hitDetection(i, j) {
        return checkCoordinates(players[i].getX(), players[i].getY(), players[j].getX(), players[j].getY())
            && players[i].id != players[j].id
            && players[i].getIsActive()
            && players[j].getIsActive()
            && (players[i].getIsCatcher() ||
                players[j].getIsCatcher());
    }

    /**
     *
     * This function checks if  players have collided
     * by iterating through all possibilities
     *
     */
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

                    // Bring it to the players' screen
                    srvMsg({ status: 2, payload: 'test collision' });

                    // Send the word out to the other players
                    gameSocket.emit("collision", {id1: players[i].id, id2: players[j].id});
                    break;
                }
            }
            ;
        }
        ;
    };


    /**
     *
     * This function checks if  two pints are in a range of each other
     * by holding a tolerance
     *
     * * @param    p1x, represents x-axis position player 1
     * * @param    p1y, represents y-axis position player 1
     * * @param    p2x, represents x-axis position player 2
     * * @param    p2y, represents y-axis position player 2
     *
     *   @return   returnVal, boolean if the tolerance has been breached
     *
     */
    function checkCoordinates(p1x, p1y, p2x, p2y) {

        var returnVal = false;

        // tolerance for collision detection
        var tol = 20;

        if (p1x < p2x + tol &&
            p1x + tol > p2x &&
            p1y < p2y + tol &&
            tol + p1y > p2y) {
            // collision detected!
            returnVal = true;
        }

        return returnVal;
    }
    /**
     *
     * This function counts and returns number of active players
     * by holding a tolerance
     *
     *   @return   countActive, number of active players
     *
     */
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
    /**
     *
     * This function checks if the game has a catcher defined
     *
     *   @return   boolean
     *
     */
    function catcherDefined() {

        var i;

        for (i = 0; i < players.length; i++) {
            if (players[i].getIsCatcher())
                return true;
        }
        ;
        return false;
    }

    /**
     *
     * This toggles a players active state
     *
     * * @param    id, player id
     * * @param    active, on / off
     *
     *   @return   boolean, if false no player has been found by id
     *
     */
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

    /**
     *
     * This sends a message to all conected players of the game
     *
     *  Message levels:
     *      1 = info
     *      2 = err
     *
     * * @param    data.status, message level
     * * @param    data.payload, message text
     *
     */
    function srvMsg(data) {
        /*
         Message levels:
         1 = info
         2 = err
         */
        console.log(data);
        gameSocket.emit("server message", {status: data.status, payload: data.payload});
    };


    // Define which variables and methods can be accessed of Game class
    return {
        id: id,
        initGame: initGame
    }


};

// Export the Game class so you can use it in
// other files by using require("Game").Game
exports.Game = Game;

