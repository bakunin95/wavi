var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Export",
	active: true,
	priority:10,
	color:"red",
	group:"js-export",
	slot:2,
	title: function(node){

		title = node.rawName;
		return title;
	}
};