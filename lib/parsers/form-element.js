var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "Forms",
	active: true,
	priority:10,
	color:"peru",
	group:"form-element",
	title: function(node){
		return node.rawType+" "+node.rawName;
	}
};