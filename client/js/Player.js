/**
 * Playerclass, this is what makes our Player ALIVE!
 *
 * @category   ClientSide
 * @author     Stefan Bakocs, Lukas Stahel
 * @license    THE BEER-WARE LICENSE (Revision 42)
 */
var Player = function(startX, startY, hexColor, newIsCatcher) {
	var x = startX,
	y = startY,
	color = hexColor,
	id,
	isActive = true,
	moveAmount = 2,
	isCatcher = newIsCatcher,
	direction = 'l';
	
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

/**
 *
 * Update player position
 *
 * * @param    the keypress event
 *
 */
	var update = function(keys) {
		
		
		// Previous position
		var prevX = x,
		prevY = y;
		
		
		// Up key takes priority over down
		if (keys.up && y > 0) {
			y -= moveAmount;
		} else if (keys.down && y < 600) {
			y += moveAmount;
		};
		
		// Left key takes priority over right
		if (keys.left && x > 0) {
			direction = 'l';
			x -= moveAmount;
		} else if (keys.right && x < 800) {
			direction = 'r';
			x += moveAmount;
		};
		
		return (prevX != x || prevY != y) ? true : false;
	};

/**
 *
 * Draw players
 *
 * * @param ctx is the canvascontext and the player which needs to be drawn
 *
 */
	var draw = function(ctx, localPlayer) {
		
		//ctx.fillRect(x-25, y-25, 50, 50);
		//ctx.fillStyle = color;
		ctx.drawImage(imgPlayer,x-25,y-25);
		
		ctx.fill();
		
	};
	

/**
 *
 * Draw catcher
 *
 * * @param    canvas context
 *
 */
	var drawCatcher = function(ctx) {
		
		//ctx.fillRect(x-25, y-25, 50, 50);
		//ctx.fillStyle = 'red';
		ctx.drawImage(imgCatcher,x-25,y-25);
		
		ctx.fill();
		
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
		draw: draw,
		drawCatcher: drawCatcher
	}
};