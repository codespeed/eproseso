'use strict'; //for node mailer

//var User = require('../models/user');
var Application = require('./ApplicationModel');
var Establishment = require('./EstablishmentModel');
var jwt = require('jwt-simple');
var moment = require('moment');
var nodemailer = require('nodemailer');

const server_email = "testserver@127.0.0.1";
const server_email_password = "testserver";

module.exports = {
	register: function (req, res) {
		console.log(req.body);


		Application.findOne({
			email: req.body.email
		}, function (err, existingUser) {

			if (existingUser)
				return res.status(409).send({
					message: 'Email is already registered'
				});

			req.body.profile_picture = '';
			//req.body.account_status = 'pending';
			req.body.account_status = 'activated';

			/*Save Establishment if not save*/
			Establishment.findOne({
				name: req.body.ioe_establishment
			}, function(est_err, est_existing){
				if (!est_existing) {
					var establishment_data = {name:req.body.ioe_establishment};
					var establishment = new Establishment(establishment_data);
					establishment.save();
				}
			});


			var application = new Application(req.body);
			application.save(function (err, result) {
				if (err) {
					res.status(500).send({
						message: err.message
					});
				}

				var verification_code = result._id;
				/*create reusable transporter object using the default SMTP transport */
				let transporter = nodemailer.createTransport({
					/*service: 'gmail',*/
					auth: {
						user: server_email,
						pass: server_email_password
					}
				});
				/*setup email data with unicode symbols*/ 
				let mailOptions = {
					from: '"eProceso" <'+ server_email +'>', /*sender address*/ 
					to: req.body.email, /*list of receivers*/ 
					subject: 'eProceso: Account Verification', /*Subject line*/ 
					text: 'If you receive this email, that means you subscribe/register from eProceso. If not, please ignore this email. Visit the like to confirm your registration. http://localhost:3000/#/registration-confirmation?confirmation-code='+ verification_code, /*plain text body*/ 
					html: '<p>If you receive this email, that means you subscribe/register from eProceso. If not, please ignore this email. Visit the like to confirm your registration. <a href="http://localhost:3000/#/registration-confirmation?confirmation-code='+ verification_code +'">http://localhost:3000/#/registration-confirmation?confirmation-code='+ verification_code +'</a></p>' /*html body*/ 
				};
				var additional_status = "";
				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						additional_status = "Successfully Registered";
					}
					additional_status = "Email Sent";
				});


				res.status(200).send({
					token: createToken(result)
				});
			})
		});
	},
	register_confirmation: function (req, res) {
		console.log(req.body);

		Application.findOne({
			_id:req.body.code
		},function(err, application_data){
			/*MONGOOSE PROCESS HERE*/ 
			application_data.account_status = "activated";
			Application.findOneAndUpdate({_id:req.body.code}, application_data, function(err, result){
				if (err) return req.status(500, function(){ message : err.message });
				return res.status(200).send({message:"Activated Success!!!"});
			});
		});
	},
	login: function (req, res) {
		Application.findOne({
			email: req.body.email,
			//{ $or: [ { email: req.body.email }, { username: req.body.email } ] }
			password: req.body.password,
			//account_status: 'activated',
			//{ $or: [ { account_status: 'activated' }, { account_status: 'approved' } ] }
		}, function (err, user) {
			if (!user)
				return res.status(401).send({
					message: 'Email or Password invalid'
				});

			if (req.body.password == user.password) {
				console.log(req.body, user.password)
				res.send({
					token: createToken(user)
				});
			} else {
				return res.status(401).send({
					message: 'Invalid email and/or password'
				});
			}
		});
	}
}

function createToken(user) {
	var payload = {
		sub: user._id,
		iat: moment().unix(),
		exp: moment().add(14, 'days').unix()
	};
	return jwt.encode(payload, 'secret');
}