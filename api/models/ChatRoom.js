/**
 * ChatRoom.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

	attributes: {
		messages: {
			collection: 'message',
			via: 'room_token'
		}
	},

	chatRooms: function(user, cb){
		ChatRoom.find({members: user.id}).sort({"createdAt": -1}).populate('messages', {sort: {'createdAt': 1}}).exec(function(err, rooms){
			if(err){
				return cb(err);
			} else {
				return cb(null, rooms);
			}
		});
	}

};

