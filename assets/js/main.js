$(document).ready(function(){

});
if(typeof loggedInUser != 'undefined' && loggedInUser && loggedInUser != ''){
	console.log('loggedInUser == ', loggedInUser);
	io.socket.get('/test', function(body, response){
		console.log('body === ', body);
		console.log('response === ', response);
	});

	io.socket.on('data', function(body, response){
		console.log('body === ', body);
		console.log('response === ', response);
	});
}