var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
		stereotype: "CSS-RULE",
		active: true,
		priority:10,
		slot:1,
		color:"palegreen",
		group:"css-rule",
		title: function(node){
			var name = parsersHelper.reduceLength(node.rawName,35);
			return name;
		}
	};