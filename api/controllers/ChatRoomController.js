/**
 * ChatRoomController
 *
 * @description :: Server-side logic for managing Chatrooms
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	chatRooms: function(req, res){
		if(req.session && req.session.user){
			ChatRoom.chatRooms(req.session.user, function(err, response){
				if(err){
					return res.negotiate(err);
				} else {
					return res.json(response);
				}
			});
		} else {
			return res.redirect('/');
		}
	}
};

