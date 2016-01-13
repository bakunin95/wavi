var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Anonymous Function",
	active: true,
	priority:10,
	color:"darkturquoise",
	group:"js-anonymous-function",
	slot:1,
	title: function(node){
		if(!_.isUndefined(node.visibility) && node.visibility !== null && node.visibility !== "NULL"){
				visibility = node.visibility;
			}
			else{
				visibility = "-";
			}
			var attr = (node.rawValue !== null) ? node.rawValue: "";
			return visibility+ "("+attr+")";
	}
};