var Establishment = require('./EstablishmentModel');

module.exports = {
    get: function (req, res) {
        Establishment.find({}).populate('establishment').exec(function (err, result) {
            res.send(result);
        });
    },
    post: function (req, res) {
        console.log(req.body, req.user);
        
        req.body.user = req.user;
        
        var establishment = new Establishment(req.body);

        establishment.save();

        res.status(200);
    }
}