/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	signup: function(req, res){
		if(!req.body || !req.body.name || !req.body.email || !req.body.password){
			return res.negotiate({status: 400, message: 'required fields are missing'});
        } else {
        	User.signup(req.body, function(err, user){
				if(err){
					return res.negotiate(err);
				} else {
					return res.json(user);
				}
			});
        }
	},

	login: function(req, res){
		if(!req.body || !req.body.email || !req.body.password){
			return res.negotiate({status: 400, message: 'required fields are missing'});
        } else {
	    	User.login(req.body, function(err, user){
	    		if(err){
	    			return res.negotiate(err);
	    		} else {
	    			return res.json(user);
	    		}
	    	});
	    }
	},

	logout: function(req, res){
		var id = req.user.id;
		User.edit(id, {loggedIn: 0}, function(err, response){
			if(err){
				return res.negotiate(err);
			} else {
				return res.json({message: 'User logged out successfully'});
			}
		});
	}

};

