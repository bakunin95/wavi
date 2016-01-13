var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "Link",
	active: true,
	priority:10,
	color:"aliceblue",
	slot:1,
	group:"link",
	title: function(node){		
		var title = "link "+node.rawName;

		return title;
	}
};