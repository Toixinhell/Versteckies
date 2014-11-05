/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, hexColor, newIsCatcher) {
	var x = startX,
		y = startY,
		color = hexColor,
		id,
		isActive = true,
		moveAmount = 2,
		isCatcher = newIsCatcher;
	
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
	
	// Update player position
	var update = function(keys) {
		
		
		// Previous position
		var prevX = x,
			prevY = y;

		// Up key takes priority over down
		if (keys.up) {
			y -= moveAmount;
		} else if (keys.down) {
			y += moveAmount;
		};

		// Left key takes priority over right
		if (keys.left) {
			x -= moveAmount;
		} else if (keys.right) {
			x += moveAmount;
		};

		return (prevX != x || prevY != y) ? true : false;
	};

	// Draw player
	var draw = function(ctx) {
		ctx.fillRect(x-25, y-25, 50, 50);
		ctx.fillStyle=color;
		ctx.drawImage(img,x-25,y-25);
	};

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getIsActive : getIsActive,
		setIsActive : setIsActive,
		setIsCatcher : setIsCatcher,
		getIsCatcher : getIsCatcher,
		update: update,
		draw: draw
	}
};