/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var bcrypt = require('bcrypt');
module.exports = {

	attributes: {
		name: {
			type: 'string',
			max: 16
	    },
	    email: {
	    	type: 'email',
	    	unique: true,
	    	required: true
	    },
	    password: {
			type: 'string'
	    },
	    loggedIn: {
			type: 'boolean',
			defaultsTo: 0,
			required: true
	    },
	    toJSON: function () {
			var obj = this.toObject();
			delete obj.password;
			return obj;
	    }
	},

	beforeCreate: function(values, next){
		if(values.password){
			var salt = bcrypt.genSaltSync(10);
			bcrypt.hash(values.password, salt, function (err, hash) {
				if(err){
					return next(err);
				} else {
					values.password = hash;
					next();
				}
			});
		} else {
			next();
		}
	},

	signup: function(opts, cb){
		User.create(opts, function(err, createdUser){
			if(err){
				return cb(err);
			} else {
				return cb(null, {message: 'user created successfully'});
			}
		});
	},

	login: function(opts, cb){
		User.findOne({email: opts.email}).exec(function(err, user){
			if(err){
				return cb(err);
			} else if(!user){
				return cb({status: 400, message: 'User not found'});
			} else {
				var match = bcrypt.compareSync(opts.password, user.password);
				if(match){
					User.edit(user.id, {loggedIn: 1}, function(err, updatedUser){
						if(err){
							return cb(err);
						} else {
							return cb(null, updatedUser);
						}
					});
				} else {
					return cb({status: 400, message: 'Email or password is incorrect'});
				}
			}
		});
	},

	edit: function(id, body, cb){
		User.update({id: id}, body, function(err, updatedUser){
			if(err){
				return cb(err);
			} else {
				return cb(null, updatedUser[0]);
			}
		});
	}

};

