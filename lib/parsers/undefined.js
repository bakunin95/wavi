var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "Undefined",
	active: true,
	priority:10,
	color:"DarkMagenta",
	group:"undefined",
	title: function(node){
		var name = node.rawName;	
		return name;
	}
};