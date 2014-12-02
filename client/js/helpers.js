/**
 * This are our Helperfunctions, everything that doesn't belong into other logics
 * is residing here
 *
 * @category   ClientSide
 * @author     Stefan Bakocs, Lukas Stahel
 * @license    THE BEER-WARE LICENSE (Revision 42)
 */
 

/**
 *
 * Slides in the messagebox
 *
 */
function slideInMessage(){
	jQuery('#gameOver').animate({left: -35},'fast');
}

/**
 *
 * Slides out the messagebox
 *
 */
function slideOutMessage(){
	jQuery('#gameOver').animate({left: -250}, 'fast');
}

/**
 *
 * Calculates a random Hex Color Code
 *
 */
function getRandomColor(){
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 *
 * If someone collided we write this to our log
 *
 */
function writeCollisionHTML(data){
	html = '<p><span style="color:red;">'+data.id1+' </span>collided with<span style="color:green;"> '+data.id2+'</span></p>';
	jQuery('#log').prepend(html);
}

/**
 *
 * Writes general server message into Log
 *
 */
function writeServerMessage(data){
	html = '<p>ServerMessage</p>';
	jQuery('#log').prepend(html);
}

/**
 *
 * Writes general server info into the slider
 *
 */
function writeServerInfo(data){
	//1 = info
	//2 = error
	
	slideOutMessage();
	var type = data.status;
	var message = data.payload;
	var html = '';
	
	switch(type){
	case 1:
		html = '<p style="color:blue;">'+message+'</p>';
		break;
	case 2:
		html = '<p style="color:red;">'+message.toUpperCase()+'</p>';
		break;
	}
	
	jQuery('#gameOver').empty().append(html);
	slideInMessage();
}

/**
 *
 * Writes message for our winner
 * TODO: Draw into canvas
 *
 */
function drawWinnerNotice(){
	$('#gameOver h1').empty().append("You Won!");
	slideInMessage();
}

/**
 *
 * Writes message for our loser
 * TODO: Draw into canvas
 *
 */
function drawLooserNotice(){
	$('#gameOver h1').empty().append("THE GAME");
	slideOutMessage();
}

