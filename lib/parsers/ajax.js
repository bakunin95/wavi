var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "AJAX",
	active: true,
	priority:10,
	color:"darkorange",
	group:"ajax",
	title: function(node){
		return "GET";
	}
};