var mongoose = require('mongoose');

module.exports = mongoose.model('Account', {
	username : String(),
	password : String(),
});