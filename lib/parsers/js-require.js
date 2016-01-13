var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Require",
	active: true,
	priority:10,
	color:"azure",
	group:"js-require",
	slot:2,
	title: function(node){
		title = node.rawName;
		return title;
	}
};