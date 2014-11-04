function getRandomColor() {
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
