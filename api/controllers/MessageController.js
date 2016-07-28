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
			Message.create(msgOPTS, function(err, createdMSG){
				if(err){
					return res.negotiate(err);
				} else {
					User.findOne({id: createdMSG.to}).exec(function(err, receiver){
						if(!err && receiver){
							_.each(receiver.socket_ids, function(sid){
								sails.sockets.broadcast(sid, 'message', createdMSG);
							});
						}
					});
					return res.ok();
				}
			});
		} else {
			return res.badRequest({message: "You have not loggedIn"});
		}
	}

	// messageHistory: function(req, res){
	// 	Message.find({})
	// }
};

