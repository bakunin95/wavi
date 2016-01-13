var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript",
	active: true,
	priority:10,
	color:"aliceblue",
	group:"js",
	title: function(node){		
		return node.name;
	}
};