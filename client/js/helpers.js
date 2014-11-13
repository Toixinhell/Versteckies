function slideInMessage(){
	$('#gameOver').animate({left: -250});
}

function slideOutMessage(){
	$('#gameOver').animate({left: -20});
}

function getRandomColor(){
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function writeCollisionHTML(data){
	html = '<p><span style="color:red;">'+data.id1+' </span>collided with<span style="color:green;"> '+data.id2+'</span></p>';
	jQuery('#log').prepend(html);
}

function writeServerMessage(data){
	html = '<p>ServerMessage</p>';
	jQuery('#log').prepend(html);
}

function writeServerInfo(data){
	//1 = info
	//2 = error
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
	
	jQuery('#gameInfo').append(html);
}

function drawWinnerNotice(){
	$('#gameOver h1').empty().append("You Won!");
	slideInMessage();
}

function drawLooserNotice(){
	$('#gameOver h1').empty().append("THE GAME");
	slideOutMessage();
}

