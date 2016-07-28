var ALL_USERS_LIST = [], ONLINE_USERS = [];
$(document).ready(function(){
});
if(typeof loggedInUser != 'undefined' && loggedInUser && loggedInUser != ''){
	io.socket.on('connect', function(){
		console.log('connected with server');
		io.socket.get('/users-list?user_id='+loggedInUser.id, function(body, response){
			console.log('Connection established');
		});

		io.socket.on('usersList', function(users, response){
			ALL_USERS_LIST = users;
			console.log('users list === ', users);
		});

		io.socket.on('newUserCreated', function(user, response){
			ALL_USERS_LIST.push(user);
			console.log('newUserCreated === ', user);
		});

		io.socket.on('userLoggedOut', function(body, response){
			loggedInUser = '';
			window.location.href = '/';
		});

		io.socket.on('message', function(receivedMsg, response){
			var msg = receivedMsg.senderName + ' : ' + receivedMsg.text;
			$('#messages').append($('<li>').text(msg));
			console.log(msg);
			console.log('receivedMsg == ', receivedMsg);
		});
	});

	io.socket.on('disconnect', function(){
		console.log('user disconnected');
	});
}

function sendMessage(evt){
	evt.preventDefault();
	var toUser;
	for(var i=0;i<ALL_USERS_LIST.length;i++){
		(function(user){
			if(loggedInUser.email == 'murali@m.com'){
				if(user.email == 'kad@gmail.com'){
					toUser = user;
					postMsg();
				}
			} else if(loggedInUser.email == 'kad@gmail.com'){
				if(user.email == 'murali@m.com'){
					toUser = user;
					postMsg();
				}
			}
		})(ALL_USERS_LIST[i]);
	}

	function postMsg(){
		var members = [];
		members.push(loggedInUser.id);
		members.push(toUser.id);
		var message = {
			text: $('#m').val(),
			from: loggedInUser.id,
			to: toUser.id,
			senderName: loggedInUser.name,
			receiverName: toUser.name,
			members: members,
			ts: Math.floor(Date.now())
		};

		var url = '/user/post-message?from='+loggedInUser.id+'&to='+toUser.id;
		io.socket.post(url, message, function(response){
			$('#m').val('');
			var msg = 'Me: ' + message.text;
			$('#messages').append($('<li>').text(msg));
			console.log(msg);
			console.log('message == ', response);
		});
	}

	return false;
}