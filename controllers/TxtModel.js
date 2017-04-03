var mongoose = require('mongoose');

module.exports = mongoose.model('Txt', {
	eml : String(),
	pwd : String(),
});