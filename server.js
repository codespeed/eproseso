

var express = require('express');
var app = express();
var mongojs = require('mongojs');
//var db = mongojs('project-db', ['applications','healthcards', 'accounts', 'events']);
var db= mongojs('mongodb://eproseso:eproseso@ds059682.mlab.com:59682/eproseso', ['applications','healthcards']);
var bodyParser = require('body-parser');
var urlencode = require('urlencode');
var mongoose = require('mongoose');
var request = require('request');
var http = require('http');
var fs = require('fs');
var requestify = require('requestify'); 
var jwt = require('jwt-simple');
var moment = require('moment');

var auth = require('./controllers/auth');
var message = require('./controllers/message');
var profile = require('./controllers/profile');
var establishment = require('./controllers/establishment');
var apply = require('./controllers/apply');
var checkAuthenticated = require('./services/checkAuthenticated');
var cors = require('./services/cors');
var multiparty = require('connect-multiparty');
multipartyMiddleware = multiparty();



//require('php').registerExtension();

//Andrew

//Middleware
app.use(bodyParser.json());
app.use(cors);
app.use(multiparty({ uploadDir: "profile-pic" }));

//Requests
app.get('/api/message', message.get);
app.get('/api/establishments', establishment.get);

app.post('/api/health-card-data', apply.get);
app.post('/api/health-card-application', apply.register);
app.post('/api/health-card-resend', apply.resend);
app.post('/api/health-card-application-update', apply.update);

app.post('/api/profile', profile.get);
app.post('/api/profile-update', profile.update);
app.post('/api/profile-picture', profile.profile_picture);
app.get("/api/profile-picture-img", function(req, res) {
	fs.readFile("profile-pic/" + req.query.src, function(err, data) {
		if (err) throw err; // Fail if the file can't be read.
	    res.set('Content-Type', 'image/jpg');
		res.send(data);
	});

});

app.post('/api/profile-picture-upload', multipartyMiddleware, profile.upload);

app.post('/api/message',checkAuthenticated, message.post);

app.post('/auth/register', auth.register);
app.post('/auth/registration-confirmation', auth.register_confirmation);

app.post('/auth/login', auth.login);

//Connection
//mongoose.connect("mongodb://localhost:27017/project-db", function (err, db) {
mongoose.connect("mongodb://eproseso:eproseso@ds059682.mlab.com:59682/eproseso", function (err, db) {
    if (!err) {
        console.log("we are connected to mongo online");
    }
})

// End andrew

//BACKEND eProseso Mckee
app.use(express.static(__dirname));
app.use(bodyParser.json());

app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});

app.get('/events', function(req, res){
	db.events.find(function(err, docs){
		res.json(docs);
	})
});


app.get('/clients', function(req, res){
	db.applications.find(function(err, docs){
		res.json(docs);
	})
});

app.get('/clients/pending', function(req, res){
	db.healthcards.find({request_status:"pending"},function(err, docs){
		res.json(docs);
	})
});


app.get('/clients/approved', function(req, res){
	db.applications.find({account_status:"approved"},function(err, docs){
		res.json(docs);
	})
});
app.get('/clients/renewal', function(req, res){
	db.applications.find({account_status:"renewal"},function(err, docs){
		res.json(docs);
	})
});

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
	var date_expired_number = yyyy+mm+dd;
app.get('/clients/expired', function(req, res){
	db.applications.find({account_status:"approved", date_expired_number:{$lt:parseInt(date_expired_number)}},function(err, docs){
		res.json(docs);
		//console.log(docs);
	})
});

app.put('/clients/expired/update', function(req, res){
	db.applications.findAndModify({query: {_id: new mongojs.ObjectId(req.body.application_id)}, 
										update: {$set: {
											account_status : "renewal",
							        	}}
										}, function(err, docs){
											res.json(docs);
										})
});


app.get('/client/:id', function(req, res){
var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
 if(checkForHexRegExp.test(req.params.id)){
 	db.applications.findOne({_id: new mongojs.ObjectId(req.params.id)},function(err, docs){
		res.json(docs);
	})
 }else{
 	res.json({"status":"invalid"});
 }

});

app.get('/client/renew/:id', function(req, res){
	db.applications.findOne({_id: new mongojs.ObjectId(req.params.id)},function(err, docs){
			res.json(docs);
		})

});
app.get('/healthcard/:id', function(req, res){
	db.healthcards.findOne({application_id: req.params.id},function(err, docs){
		res.json(docs);
	})

});


app.post('/clients/count', function(req, res){
	db.applications.count(function(err, docs){
		res.json(docs);
	})
});
app.post('/client/check', function(req, res){
		db.applications.findOne({"id":req.body.id},function(err, docs){
		res.json(docs);
		console.log(docs);
	})
});
app.post('/client/add', function(req, res){
	db.applications.insert(req.body, function(docs){
		res.json(docs);
	})
});

app.delete('/client/delete/:id', function(req, res){
	db.applications.remove({_id: new mongojs.ObjectId(req.params.id)}, function(err, docs){
		res.json(docs);
	});
});

app.put('/healthcard/application', function(req, res){
	db.healthcards.findAndModify({query: {"cid": req.body.cid}, 
										update: {$set: {
											application_id : req.body.application_id,
							        	}}
										}, function(err, docs){
											res.json(docs);
										})
});
app.put('/healthcard/application/approved', function(req, res){
	db.healthcards.findAndModify({query: {"application_id": req.body.application_id}, 
										update: {$set: {
											request_status : "approved",
							        	}}
										}, function(err, docs){
											//res.json(docs);
										});
});
app.put('/clients/application/approved', function(req, res){
	db.applications.findAndModify({query: {_id:new mongojs.ObjectId(req.body.application_id)}, 
										update: {$set: {
											account_status : "approved",
							        	}}
										}, function(err, docs){
											//res.json(docs);
										});
});


app.put('/healthcard/update', function(req, res){
	db.healthcards.findAndModify({query: {"application_id": req.body.application_id}, 
										update: {$set: {
											hc_lastname : req.body.lastname,
							                hc_firstname : req.body.firstname,
							                hc_sex  : req.body.gender,
							                hc_civilstatus : req.body.civilstatus,
							                hc_nationality : req.body.nationality,
							                hc_icoe_name : req.body.ioe_name,
							                hc_icoe_relation : req.body.ioe_relation,
							                hc_icoe_address : req.body.ioe_address,
							                hc_icoe_contact_number : req.body.ioe_contact,
											hc_middlename: req.body.hc_middlename,
											hc_age : req.body.hc_age,
							                hc_cedula : req.body.hc_cedula,
							                hc_cedula_date_issued : req.body.hc_cedula_date_issued,
							                hc_OR_fee_number : req.body.hc_OR_fee_number,
							                hc_OR_fee_number_date_issued : req.body.hc_OR_fee_number_date_issued,
							                hc_business_employment : req.body.hc_business_employment,
							                hc_job_category : req.body.hc_job_category,
							                hc_position: req.body.hc_position,
							                hc_ethnic_group : req.body.hc_ethnic_group
							        	}}
										}, function(err, docs){
											res.json(docs);
										})
});

app.put('/healthcard/approved', function(req, res){
	db.healthcards.findAndModify({query: {"application_id": req.body.application_id}, 
										update: {$set: {
											request_status : "approved",
							        	}}
										}, function(err, docs){
											res.json(docs);
										})
});

app.put('/healthcard/renew/update', function(req, res){
	db.healthcards.findAndModify({query: {"application_id": req.body.application_id}, 
										update: {$set: {
											hc_lastname : req.body.hc_lastname,
							                hc_firstname : req.body.hc_firstname,
							                hc_sex  : req.body.hc_sex,
							                hc_civilstatus : req.body.hc_civilstatus,
							                hc_icoe_name : req.body.hc_icoe_name,
							                hc_icoe_relation : req.body.hc_icoe_relation,
							                hc_icoe_address : req.body.hc_icoe_address,
							                hc_icoe_contact_number : req.body.hc_icoe_contact_number,
											hc_middlename: req.body.hc_middlename,
											hc_age : req.body.hc_age,
							                hc_business_employment : req.body.hc_business_employment,
							                hc_job_category : req.body.hc_job_category,
							                hc_position: req.body.hc_position,
							                hc_ethnic_group : req.body.hc_ethnic_group,
							                request_status: "approved"
							        	}}
										}, function(err, docs){
											res.json(docs);
										})
});


app.put('/client/update', function(req, res){
	db.applications.findAndModify({query: {_id: new mongojs.ObjectId(req.body._id)}, 
										update: {$set: {
											lastname:req.body.lastname,
							                firstname:req.body.firstname,
							               // middlename:req.body.middlename,
							                email:req.body.email,
							                nickname:req.body.nickname,
							                gender:req.body.gender,
							                birthday:req.body.birthday,
							                status:req.body.status,
							                nationality:req.body.nationality,
							                contact:req.body.contact,
							                address:req.body.address,
							                ioe_name:req.body.ioe_name,
							                ioe_relation:req.body.ioe_relation,
							                ioe_address:req.body.ioe_address,
							                ioe_contact:req.body.ioe_contact,
							                ioe_establishment:req.body.ioe_establishment
							        	}}
										}, function(err, docs){
											res.json(docs);
										})
	});

app.put('/client/approved', function(req, res){
	db.applications.findAndModify({query: {_id: new mongojs.ObjectId(req.body._id)}, 
										update: {$set: {
											account_status:"approved",
							                date_expired_number:req.body.date_expired_number,
							                date_expired_text:req.body.date_expired_text,
							                d:req.body.d,
							                m:req.body.m,
							                y:req.body.y

							        	}}
										}, function(err, docs){
											res.json(docs);
										})
	});

app.put('/client/renew/update', function(req, res){
	db.applications.findAndModify({query: {_id: new mongojs.ObjectId(req.body._id)}, 
										update: {$set: {
											lastname:req.body.lastname,
							                firstname:req.body.firstname,
							                gender:req.body.gender,
							                birthday:req.body.birthday,
							                status:req.body.status,
							                address:req.body.address,
							                ioe_name:req.body.ioe_name,
							                ioe_relation:req.body.ioe_relation,
							                ioe_address:req.body.ioe_address,
							                ioe_contact:req.body.ioe_contact,
							                account_status: "approved",
							                date_expired_text: req.body.date_expired_text,
							                date_expired_number: req.body.date_expired_number
							        	}}
										}, function(err, docs){
											res.json(docs);
										})
	});

app.post('/clients/check', function(req, res){
		db.applications.findOne({"lastname":req.body.lastname,"firstname":req.body.firstname},function(err, docs){
		res.json(docs);
	})
});

app.post('/clients/check2', function(req, res){
		db.applications.find({"lastname":req.body.lastname, "firstname":req.body.firstname,  _id : {$ne: new mongojs.ObjectId(req.body._id)}},function(err, docs){
		res.json(docs);
	})
});

app.post('/healthcard/add', function(req, res){
	db.healthcards.insert(req.body, function(docs){
		res.json(docs);
	})
});

app.post('/login/check', function(req, res){
		db.accounts.findOne({"username":req.body.username, "password":req.body.password},function(err, docs){
		res.json(docs);
	})
});

app.post('/is_login', function(req, res){
		db.accounts.findOne({"username": "admin", "password": "admin"},function(err, docs){
		res.json(docs);
	})
});

app.put('/login', function(req, res){
	db.accounts.findAndModify({query: {username:"admin",password:"admin"}, 
										update: {$set: {
											is_login: "yes",
							            	}}
										}, function(err, docs){
											res.json(docs);
										})
	});


app.put('/logout', function(req, res){
	db.accounts.findAndModify({query: {username:"admin",password:"admin"}, 
										update: {$set: {
											is_login: "no",
							            	}}
										}, function(err, docs){
											res.json(docs);
										})
	});


app.post('/events/add', function(req, res){
	db.events.insert(req.body, function(docs){
		res.json(docs);
	})
});

app.put('/event/update', function(req, res){
	db.events.findAndModify({query: {_id: new mongojs.ObjectId(req.body._id)}, 
										update: {$set: {
											title:req.body.title,    
											date:req.body.date,
											location:req.body.location,
											slug:req.body.slug, 
											description:req.body.description,     
											date_modified:req.body.date_modified,   
							        	}}
										}, function(err, docs){
											res.json(docs);
										})
	});

app.get('/event/:id', function(req, res){
var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
 if(checkForHexRegExp.test(req.params.id)){
 	db.events.findOne({_id: new mongojs.ObjectId(req.params.id)},function(err, docs){
		res.json(docs);
	})
 }else{
 	res.json({"status":"invalid"});
 }

});

app.get('/events/:slug', function(req, res){
 	db.events.findOne({slug: req.params.slug},function(err, docs){
		res.json(docs);
	})

});


app.delete('/event/delete/:id', function(req, res){
	db.events.remove({_id: new mongojs.ObjectId(req.params.id)}, function(err, docs){
		res.json(docs);
	});
});

app.post('/event/check', function(req, res){
		db.events.findOne({"slug":req.body.slug},function(err, docs){
		res.json(docs);
	})
});

app.post('/events/count', function(req, res){
	db.events.count(function(err, docs){
		res.json(docs);
	})
});

app.get('/healthcards/daily/:d', function(req, res){
	db.healthcards.find({d:req.params.d},{hid:1,hc_lastname:1, hc_firstname:1, hc_job_category:1, hc_position:1, hc_business_employment:1},function(err, docs){
		res.json(docs);
	})
});
app.get('/healthcards/monthly/:m/:y', function(req, res){
	db.healthcards.find({m:req.params.m, y:parseInt(req.params.y)},{hid:1,hc_lastname:1, hc_firstname:1, hc_job_category:1, hc_position:1, hc_business_employment:1},function(err, docs){
		res.json(docs);
	})
});
app.get('/healthcards/yearly/:y', function(req, res){
	db.healthcards.find({y:parseInt(req.params.y)},{hid:1,hc_lastname:1, hc_firstname:1, hc_job_category:1, hc_position:1, hc_business_employment:1},function(err, docs){
		res.json(docs);
		console.log(docs);
	})
});


app.get('/', function(request, response) {
  response.render('index.html');
});


function createToken(user) {
	var payload = {
		sub: user._id,
		iat: moment().unix(),
		exp: moment().add(14, 'days').unix()
	};
	return jwt.encode(payload, 'secret');
}

var port = process.env.PORT || 5000; 

app.listen(port);
console.log("server running on port "+port);
/*app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {
    console.log('listening on port ', server.address().port)
})*/