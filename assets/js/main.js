$(document).ready(function(){

});
if(typeof loggedInUser != 'undefined' && loggedInUser && loggedInUser != ''){
	io.socket.on('connect', function(){
		console.log('connected with server');
		io.socket.get('/users-list?user_id='+loggedInUser.id, function(body, response){
			console.log('Connection established');
		});

		io.socket.on('usersList', function(body, response){
			console.log('body === ', body);
		});

		io.socket.on('userLoggedOut', function(body, response){
			loggedInUser = '';
			window.location.href = '/';
		});

		io.socket.on('post message', function(body, response){
			console.log("post message start");
			console.log('body == ', body);
			console.log("post message end");
		});
	});

	io.socket.on('disconnect', function(){
		console.log('user disconnected');
	});
}