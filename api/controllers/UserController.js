/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var bcrypt = require('bcrypt');
module.exports = {

	home: function(req, res){
		if(req.session.user && req.session.user.loggedIn){
			if(req.path.indexOf('/user/login') > -1){
                return res.redirect('/');
            } else {
            	return res.view('index', {user: req.session.user});
            }
		} else {
			if(req.method == 'POST'){
				if(!req.body || !req.body.email || !req.body.password){
					return res.negotiate({status: 400, message: 'required fields are missing'});
		        } else {
		        	if(req.body.Submit){
		        		delete req.body['Submit'];
		        	}
			    	User.login(req.body, function(err, user){
			    		if(err){
			    			return res.negotiate(err);
			    		} else {
			    			req.session.user = user;
			    			if(req.path.indexOf('/user/login') > -1){
				                return res.redirect('/');
				            } else {
				            	return res.view('index', {user: req.session.user});
				            }
			    		}
			    	});
			    }
			} else {
				return res.view('login');
			}
		}
	},
	
	signup: function(req, res){
		if(req.session.user){
			return res.redirect('/');
		} else {
			if(req.method == 'POST'){
				if(!req.body || !req.body.name || !req.body.email || !req.body.password){
					return res.negotiate({status: 400, message: 'required fields are missing'});
		        } else {
		        	if(req.body.Submit){
		        		delete req.body['Submit'];
		        	}
		        	if(req.body.repassword){
		        		delete req.body['repassword'];
		        	}
		        	User.signup(req.body, function(err, user){
						if(err){
							return res.negotiate(err);
						} else {
							return res.json(user);
						}
					});
		        }
		    } else {
		    	return res.view('signup');
		    }
		}
	},

	login: function(req, res){
		if(req.session.user){
			return res.redirect('/');
		} else {
			if(req.method == 'POST'){
				if(!req.body || !req.body.email || !req.body.password){
					return res.negotiate({status: 400, message: 'required fields are missing'});
		        } else {
		        	if(req.body.Submit){
		        		delete req.body['Submit'];
		        	}
		        	User.login(req.body, function(err, user){
			    		if(err){
			    			return res.negotiate(err);
			    		} else {
			    			req.session.user = user;
			    			if(req.path.indexOf('/user/login') > -1){
				                return res.redirect('/');
				            } else {
				            	return res.view('index', {user: req.session.user});
				            }
			    		}
			    	});
			    }
			} else {
				return res.view('login');
			}
		}
	},

	logout: function(req, res){
		if(req.session.user){
			var id = req.session.user.id;
			User.edit(id, {loggedIn: 0}, function(err, response){
				delete req.session['user'];
				if(err){
					return res.negotiate(err);
				} else {
					return res.redirect('/');
				}
			});
		} else {
			return res.redirect('/');
		}
	},

	test: function(req, res){
		if(!req.isSocket){
			sails.log.debug("Not a socket request");
			return res.badRequest({message: "Not a socket request"});
		}
		sails.log.debug('Socket ID == ', sails.sockets.getId(req.socket));
		sails.sockets.broadcast(sails.sockets.getId(req.socket), 'data', {message: 'Hello World!'});
		return res.ok();
	},

	users: function(req, res){
		if(!req.isSocket){
			sails.log.debug("Not a socket request");
			return res.badRequest({message: "Not a socket request"});
		}
		
		return res.ok();
	}

};

