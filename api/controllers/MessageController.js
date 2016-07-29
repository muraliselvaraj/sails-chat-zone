/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	sendMessage: function(req, res){
		if(!req.isSocket){
			sails.log.debug("Not a socket request");
			return res.badRequest({message: "Not a socket request"});
		}
		if(req.session.user){
			var socket_id = sails.sockets.getId(req.socket);
			var msgOPTS = req.body;
			var chatOPTS = {
				auth_user_name: msgOPTS.auth_user_name,
				auth_user_id: msgOPTS.auth_user_id,
				members: (msgOPTS.members) ? msgOPTS.members : [],
				room_name: (msgOPTS.room_name) ? msgOPTS.room_name : ''
			};
			var current_chat_tocken = (msgOPTS.current_chat_tocken) ? msgOPTS.current_chat_tocken : '';
			if(msgOPTS.current_chat_tocken){
				delete msgOPTS['current_chat_tocken'];
			}
			console.log('current_chat_tocken == ', current_chat_tocken);
			if(msgOPTS.room_token){
				ChatRoom.findOne({id: msgOPTS.room_token}).exec(function(err, room){
					if(err){
						return res.negotiate(err);
					} else if(!room){
						return res.negotiate({status: 404, message: 'Room not found'});
					} else {
						Message.create(msgOPTS, function(err, createdMSG){
							if(err){
								return res.negotiate(err);
							} else {
								if(current_chat_tocken){
									createdMSG.chat_type = 'old';
								} else {
									createdMSG.chat_type = 'added_to_old';
								}
								var user_ids = [];
								_.each(room.members, function(member){
									user_ids.push({id: member});
								});
								User.find({'$or': user_ids}).exec(function(err, receivers){
									if(!err){
										_.each(receivers, function(receiver){
											(function(receiver){
												_.each(receiver.socket_ids, function(sid){
													sails.sockets.broadcast(sid, 'message', createdMSG);
												});
											})(receiver);
										});
									}
								});
								return res.ok();
							}
						});
					}
				});
			} else {
				ChatRoom.create(chatOPTS, function(err, createdRoom){
					if(err){
						return res.negotiate(err);
					} else {
						msgOPTS.room_token = createdRoom.id;
						Message.create(msgOPTS, function(err, createdMSG){
							if(err){
								return res.negotiate(err);
							} else {
								createdMSG.chat_type = 'new';
								var user_ids = [];
								_.each(msgOPTS.members, function(member){
									user_ids.push({id: member});
								});
								User.find({'$or': user_ids}).exec(function(err, receivers){
									if(!err){
										_.each(receivers, function(receiver){
											console.log('receiver == ', receiver);
											(function(receiver){
												_.each(receiver.socket_ids, function(sid){
													sails.sockets.broadcast(sid, 'message', createdMSG);
												});
											})(receiver);
										});
									}
								});
								return res.ok();
							}
						});
					}
				});
			}
		} else {
			return res.badRequest({message: "You have not loggedIn"});
		}
	}

	// messageHistory: function(req, res){
	// 	Message.find({})
	// }
};

