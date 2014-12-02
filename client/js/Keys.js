/**
 * Keyclass, contrary popular opinion, this is not used to make music.
 * It intercepts our keystrokes and takes the necessary action
 *
 * @category   ClientSide
 * @author     Stefan Bakocs
 * @license    THE BEER-WARE LICENSE (Revision 42)
 */
 
var Keys = function(up, left, right, down) {
	var up = up || false,
		left = left || false,
		right = right || false,
		down = down || false;
	

/**
 *
 * Every tick the key is pressed down we have to get the direction
 *
 */	
	var onKeyDown = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			// Controls
			case 37: // Left
				that.left = true;
				break;
			case 38: // Up
				that.up = true;
				break;
			case 39: // Right, will take priority over the left key!
				that.right = true;
				break;
			case 40: // Down
				that.down = true;
				break;
		};
	};

/**
 *
 * Every tick the key is released, we have to set that we're not pressing it anymore
 *
 */	
	var onKeyUp = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 37: // Left
				that.left = false;
				break;
			case 38: // Up
				that.up = false;
				break;
			case 39: // Right
				that.right = false;
				break;
			case 40: // Down
				that.down = false;
				break;
		};
	};

	return {
		up: up,
		left: left,
		right: right,
		down: down,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	};
};