var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "HTML Markup",
	active: true,
	priority:10,
	color:"lavenderblush",
	group:"html-markup",
	title: function(node){
		return node.name;
	}
};