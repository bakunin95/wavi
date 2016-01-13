var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
		stereotype: "CSS Markup",
		active: true,
		priority:10,
		color:"palegreen2",
		group:"css-markup",
		title: function(node){		
			return "";
		}
	};