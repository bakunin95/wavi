var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Markup",
	active: true,
	priority:10,
	color:"aliceblue",
	group:"js-markup",
	title: function(node){		
		return "";
	}
};