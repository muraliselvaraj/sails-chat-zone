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
			var sessionUser = JSON.parse(JSON.stringify(req.session.user));
			var id = req.session.user.id;
			async.waterfall([
				function(callback){
					User.findOne({id: id}).exec(function(err, user){
						callback(err, user);
					});
				},
				function(user, callback){
					User.edit(id, {loggedIn: 0, socket_ids: []}, function(err, loggedOutUser){
						delete req.session['user'];
						callback(null, user);
					});
				},
				function(user, callback){
					if(user){
						_.each(user.socket_ids, function(sid){
							sails.sockets.broadcast(sid, 'userLoggedOut', {message: 'User logged out successfully'});
						});
					} else {
						_.each(sessionUser.socket_ids, function(sid){
							sails.sockets.broadcast(sid, 'userLoggedOut', {message: 'User logged out successfully'});
						});
					}
					callback();
				}
			], function(err, resp){
				if(err){
					return res.negotiate(err);
				} else {
					return res.ok();
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
		if(!req.isSocket && !req.param('user_id')){
			sails.log.debug("Not a socket request or user id is not present");
			return res.badRequest({message: "Not a socket request"});
		}
		// var sockets = sails.sockets.subscribers();
		// console.log('sockets == ', sockets);
		// var socketIDS = sails.sockets;
		// console.log('socketIDS == ', socketIDS);
		if(req.session.user){
			var socket_id = sails.sockets.getId(req.socket);
			var user_id = req.param('user_id');
			async.waterfall([
				function(callback){
					User.findOne({id: user_id}).exec(function(err, user){
						callback(err, user);
					});
				},
				function(user, callback){
					if(user){
						var socket_ids = (user.socket_ids) ? user.socket_ids : [];
						socket_ids.push(socket_id);
						var reqBody = {
							socket_ids: socket_ids
						};
						req.session.user.socket_ids = socket_ids;
						User.edit(user_id, reqBody, function(err, response){
							callback(err, response);
						});
					} else {
						callback(null, null);
					}
				},
				function(user, callback){
					if(user){
						User.find({id: {'!': user_id}}).exec(function(err, users){
							callback(null, user, users);
						});
					} else {
						callback(null, null, []);
					}
				}
			], function(err, user, users){
				if(user){
					_.each(user.socket_ids, function(sid){
						sails.sockets.broadcast(sid, 'usersList', users);
					});
				} else {
					sails.sockets.broadcast(sails.sockets.getId(req.socket), 'usersList', users);
				}
			});
		} else {
			return res.badRequest({message: "You have not loggedIn"});
		}

		return res.ok();
	}

};

