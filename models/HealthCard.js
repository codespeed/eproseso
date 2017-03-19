var mongoose = require('mongoose');

module.exports = mongoose.model('HealthCard', {
	application_id : String(),
	hc_lastname : String(),
	hc_firstname : String(),
	hc_middlename : String(),
	hc_age : String(),
	hc_sex : String(),
	hc_civilstatus : String(),
	hc_nationality : String(),
	hc_cedula : String(),
	hc_cedula_date_issued : String(),
	hc_OR_fee_number : String(),
	hc_OR_fee_number_date_issued : String(),
	hc_icoe_name : String(),
	hc_icoe_relation : String(),
	hc_icoe_address : String(),
	hc_icoe_contact_number : String(),
	hc_contact : String(),

	hc_job_category : String(),
	hc_position : String(),
	hc_business_employment : String(),
	hc_ethnic_group : String(),

	request_status : String(),
	verification_code : String(),
});