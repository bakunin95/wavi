var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
		stereotype: "CSS",
		active: true,
		priority:10,
		color:"palegreen",
		group:"css",
		title: function(node){
			return node.name;
		}
	};