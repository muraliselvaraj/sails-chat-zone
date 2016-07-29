var ALL_USERS_LIST = [], ONLINE_USERS = [];
function formatState (state) {
    return "<img class='img-flag' src='images/default_user.png' style='width:20px;height:20px;margin-right:3px;'/>" + state.text;
}
$(document).ready(function(){

	$(".message").keypress(function(event){
        if(event.which == 13){
            var message_div = $(this).parents().find('.message-div');
            var message_send = $(message_div).find('.message-send').trigger('click');
        }
    });

	$(".new-message").click(function(){
        $(".conversation-box").addClass('hide');
        $(".new-conversation-box").removeClass('hide');
        $("#chat_users_list").select2({
            allowClear: true,
            formatResult: formatState,
            formatSelection: formatState
        });
    });

    $(".chat-head").click(function(){
        $(".chat-head").removeClass('active');
        var room_token = $(this).attr('data-room-token');
        $(".conversation-box").addClass('hide');
        $(".new-conversation-box").addClass('hide');
        $("#ChatRoomBox"+room_token).removeClass('hide');
        $(this).addClass('active');
    });

    $('.message-send').click(function(){
        var message_div = $(this).parents().find('.message-div:last');
        var message = $(message_div).find('.message').val();
        if($.trim(message) != ''){
            var room_token = $(this).attr('data-room-token');
            var valid_chat_room = true;
            if($.trim(room_token) == ''){
                if($.trim($("#chat_users_list").val()) != ''){
                	var user_ids = [];
		            user_ids.push($("#chat_users_list").val());
		            user_ids.push(loggedInUser.id);
                    var msg = {
                        text: message,
                        members: user_ids,
                        room_token: room_token,
                        auth_user_id: loggedInUser.id,
                        auth_user_name: loggedInUser.name,
                        ts: Math.floor(Date.now())
                    };
                } else {
                    valid_chat_room = false;
                }
            } else {
                var msg = {
                    text: message,
                    room_token: room_token,
                    auth_user_id: loggedInUser.id,
                    auth_user_name: loggedInUser.name,
                    ts: Math.floor(Date.now())
                };
            }
            console.log(msg);
            if(valid_chat_room){
                sendMessage(msg);
                $(message_div).find('.message').val('');
            } else {
                if($.trim($("#chat_users_list").val()) == ''){
                    alert("Please Select Users to Initiate Chat");
                    return false;
                }
            }
        }
    });

});
if(typeof loggedInUser != 'undefined' && loggedInUser && loggedInUser != ''){
	io.socket.on('connect', function(){
		io.socket.get('/users-list?user_id='+loggedInUser.id, function(body, response){
			console.log('Connection established');
		});

		io.socket.on('usersList', function(users, response){
			ALL_USERS_LIST = users;
			for(var i=0;i<ALL_USERS_LIST.length;i++){
				(function(user){
					console.log('user == ', user);
					var newOption = new Option(user.name, user.id, true, true);
					$("#chat_users_list").append(newOption).trigger('change');
				})(ALL_USERS_LIST[i]);
			}
		});

		io.socket.on('newUserCreated', function(user, response){
			ALL_USERS_LIST.push(user);
			var newOption = new Option(user.name, user.id, true, true);
			$("#chat_users_list").append(newOption).trigger('change');
		});

		io.socket.on('userLoggedOut', function(body, response){
			loggedInUser = '';
			window.location.href = '/';
		});

		io.socket.on('message', function(receivedMsg, response){
	        if(receivedMsg.chat_type == "new"){
	            var current_page_url = $(location).attr('origin')+$(location).attr('pathname');
	            window.location.href = current_page_url+"?t="+$.now()+"&cid="+receivedMsg.room_token;
	        } else if(receivedMsg.chat_type == "added_to_old"){
	            var current_page_url = $(location).attr('origin')+$(location).attr('pathname');
	            window.location.href = current_page_url+"?t="+$.now()+"&cid="+receivedMsg.room_token;
	        } else {
	            var room_token = receivedMsg.room_token;
	            var msg_pos = (receivedMsg.auth_user_id == loggedInUser.id) ? "right" : "";
	            var chat_html = '<div class="direct-chat-msg '+msg_pos+'">';
	            chat_html += '<div class="direct-chat-info clearfix"><span class="direct-chat-name pull-left">'+receivedMsg.auth_user_name+'</span>';
	            chat_html += '<span class="direct-chat-timestamp pull-right">'+new Date(receivedMsg.ts)+'</span></div>';
	            chat_html += '<img class="direct-chat-img media-object" src="images/default_user.png" alt="Message User Image">';
	            chat_html += '<div class="direct-chat-text">'+receivedMsg.text+'</div></div>';
	            console.log('chat_html == ', chat_html);
	            console.log('room_token == ', room_token);
	            $("#ChatRoomBox"+room_token).find('div.direct-chat-messages').append(chat_html);
	            //var contactTopPosition = $("#ChatRoomBox"+room_token).find('div.direct-chat-messages').find('div.direct-chat-msg:last').offset().top;
	            var contactTopPosition = $("#ChatRoomBox"+room_token).find('div.direct-chat-messages').prop('scrollHeight');
	            $("div.direct-chat-messages").animate({scrollTop: contactTopPosition});
	        }

		});
	});

	io.socket.on('disconnect', function(){
		console.log('user disconnected');
	});
}

function sendMessage(message){
	var url = '/user/post-message';
	var current_page_url = document.URL;
	var current_chat_tocken;
	if(current_page_url.indexOf('cid') > -1){
		current_page_url = current_page_url.split('&cid=');
		message.current_chat_tocken = current_page_url[1];
	}
	io.socket.post(url, message, function(response){
		console.log('message == ', response);
	});
}