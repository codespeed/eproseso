var Application = require('./ApplicationModel');

var jwt = require('jwt-simple');
var moment = require('moment');
var multiparty = require('connect-multiparty');

module.exports = {
	get: function (req, res) {
		var token = req.body.token;
		var decoded_token = jwt.decode(token, 'secret');

		if (decoded_token.sub) {
			Application.findOne({
				_id: decoded_token.sub
			}, function (err, result) {
				res.send(result);
			});
		}else{
			res.status(401).send("Invalid Token");
		}
	},
	profile_picture: function (req, res) {
		var token = req.body.token;
		var decoded_token = jwt.decode(token, 'secret');

		if (decoded_token.sub) {
			Application.findOne({
				_id: decoded_token.sub
			}, function (err, result) {
				res.send(result);
			});
		}else{
			res.status(401).send("Invalid Token");
		}
	},
	update:function(req, res){
		var token = req.body.token;
		var data = req.body.data;
		var decoded_token = jwt.decode(token, 'secret');

		if (decoded_token.sub) {
			Application.findOne({
				_id: decoded_token.sub
			}, function (err, existingUser) {
				if (!existingUser)
					return res.status(409).send({
						message: 'Unable to Update'
					});

				Application.findOneAndUpdate({_id:decoded_token.sub}, data, function(err, result){
					if (err) 
						return req.status(500).send({ message : err.message });
					return res.status(200).send({message:"Updated Successfully!!!"});
				});
			});
		}else{
			res.status(401).send("Invalod Token");
		}
	},
	post: function (req, res) {
		console.log(req.body, req.user);
		req.body.user = req.user;
		var message = new Message(req.body);
		message.save();
		res.status(200);
	},
	upload:function(req, res, next){
		var token = req.body.username;
		var decoded_token = jwt.decode(token, 'secret');

		var file = req.files.file;
		var profile_pic = file.path;

		if (decoded_token.sub) {
			Application.findOne({
				_id: decoded_token.sub
			}, function (err, existingUser) {
				if (!existingUser)
					return res.status(409).send({
						message: 'Unable to Update Profile Picture'
					});

				Application.findOneAndUpdate({_id:decoded_token.sub}, {profile_picture:profile_pic}, function(err, result){
					if (err) 
						return req.status(500).send({ message : err.message });
					return res.status(200).send({message:"Updated profile Picture Successfully!!!"});
				});
			});
		}else{
			res.status(401).send("Invalod Token");
		}
	},
}