var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "Link",
	active: true,
	priority:10,
	color:"aliceblue",
	slot:2,
	group:"js-unreachable",
	title: function(node){		
		var title = node.rawName;
		return title;
	}
};