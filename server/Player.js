/**
 * This is the Player class. It resembles an active player in the game.
 *
 * @category   ServerSide
 * @author     Lukas Stahel, Stefan Bakocs
 * @license    THE BEER-WARE LICENSE (Revision 42)
 */
var Player = function(startX, startY) {
	var x = startX,
		y = startY,
		id, 
		isActive = true,
		isCatcher = false;

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};
	
	var getIsActive = function() {
		return isActive;
	};
	
	var setIsActive = function(newIsActive) {
		isActive = newIsActive;
	};
	
	var getIsCatcher = function() {
		return isCatcher;
	};
	
	var setIsCatcher = function(newIsCatcher) {
		isCatcher = newIsCatcher;
	};
	
	// Definition of accessible objects of Player
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getIsActive : getIsActive,
		setIsActive : setIsActive,
		setIsCatcher : setIsCatcher,
		getIsCatcher : getIsCatcher,
		id: id
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;