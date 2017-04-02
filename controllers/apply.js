

var HealthCard = require('./HealthCardModel');
var Application = require('./ApplicationModel');

var jwt = require('jwt-simple');
var moment = require('moment');
var multiparty = require('connect-multiparty');
var request = require('request');
var urlencode = require('urlencode');
var requestify = require('requestify'); 

module.exports = {
	get: function (req, res) {
		var token = req.body.token;
		var decoded_token = jwt.decode(token, 'secret');
		var application_id = decoded_token.sub;

		if (decoded_token.sub) {
			HealthCard.findOne({
				application_id: application_id
			}, function (err, result) {
				res.send(result);
			});
		}else{
			res.status(401).send("Invalid Token");
		}
	},
	register: function (req, res) {
		var token = req.body.token;
		var decoded_token = jwt.decode(token, 'secret');
		var use_id = decoded_token.sub;

		var data = req.body.data;

		Application.findOne({_id:{use_id}}, function(result){
			var application_id = result.id;

			var date_expired = new Date();
            var dd = date_expired.getDate();
            var mm = date_expired.getMonth()+1; //January is 0!
            var yyyy = date_expired.getFullYear();
            if(dd<10) {
                dd='0'+dd;
            } 
            if(mm<10) {
                mm='0'+mm;
            } 
            date_expired = yyyy+mm+dd;

			var verification_code = Math.floor(1000 + Math.random() * 9000);
			data.hc_age = '';
			data.request_status = 'pending';
			data.verification_code = verification_code;
			data.hc_contact = req.body.contact;
			data.application_id = decoded_token.sub;
			data.date_expired = date_expired;
	


			var contact_number = "63"+req.body.contact;

			var hc = new HealthCard(data);
			hc.save(function (err, result) {
				/* Do SMS SEND TEXT HERE */
				// Set the headers
				var headers = {
					'User-Agent':       'Super Agent/0.0.1',
					'Content-Type':     'application/x-www-form-urlencoded'
				}

				var message = "EProseso Verification Code: " + verification_code;
				var sms_username = 'maghanoycm@gmail.com';
				var sms_hash = 'fzB5CFpuuMY-EfvbUW91JaaVywf8jsW8Zap9l3cbyS';

				var sms_number = contact_number;
				var sms_sender = "EProseso";
				var sms_message = message;

				var data = {
					'username' : sms_username,
					'hash' : sms_hash,
					'numbers' : sms_number,
					'sender' : sms_sender,
					'message' : sms_message,
				};


				// Configure the request
				var options = {
			    url: 'http://api.txtlocal.com/send/',
			    method: 'POST',
			    headers: headers,
			    form: data
				}

				var  txtlocal_username = "xtianmckeeyonahgam@gmail.com";
				var txtlocal_password= "Eproseso123";

				requestify.get('http://www.txtlocal.com/sendsmspost.php?uname='+txtlocal_username+'&pword='+txtlocal_password+'&selectednums='+contact_number+'&from=EProseso&info=1&message=Verification%20Code:'+ verification_code).then(function(response) {
						// Get the response body
						console.log(response.getBody());
					});

			 /*request(options, function (error, response, body) {
			     if (!error && response.statusCode == 200) {
				         // Print out the response body
			         console.log(body)
				     }
				})*/

				/*var options = {};

				curl.post('http://localhost/test-site/?username='+ sms_username, urlencode(data), options, function(err, response, body) {
					console.log( body );
				});*/
				/* USE req.body.verification_code */
			});

			res.status(200).send("Health Card Application has been Sumbitted. Verification code will be sent in the provide Contact number");
		});
	},
	update: function (req, res) {
		var token = req.body.token;
		var decoded_token = jwt.decode(token, 'secret');
		var use_id = decoded_token.sub;

		var data = req.body.data;

		HealthCard.findOne({
			application_id: use_id
		}, function (err, existingUser) {
			if (!existingUser)
				return res.status(409).send({
					message: 'Unable to Update'
				});

			HealthCard.findOneAndUpdate({_id:existingUser}, data, function(err, result){
				if (err) 
					return req.status(500).send({ message : err.message });
				return res.status(200).send({message:"Updated Successfully!!!"});
			});
		});
	},
	resend(req, res){
		var contact_number = "63"+req.body.cno;
		var  txtlocal_username = "xtianmckeeyonahgam@gmail.com";
		var txtlocal_password= "Eproseso123";
		var verification_code = req.body.verification_code;
				

				requestify.get('http://www.txtlocal.com/sendsmspost.php?uname='+txtlocal_username+'&pword='+txtlocal_password+'&selectednums='+contact_number+'&from=EProseso&info=1&message=Verification%20Code:'+ verification_code).then(function(response) {
				// Get the response body
				console.log(response.getBody());
			});

	}
}