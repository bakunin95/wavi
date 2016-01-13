var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Class",
	active: true,
	priority:10,
	color:"darkslategray1",
	group:"js-class",
	title: function(node){
		return node.rawName;
	}
};