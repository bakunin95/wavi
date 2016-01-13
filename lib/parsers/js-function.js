var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Function",
	active: true,
	priority:10,
	color:"darkslategray2",
	group:"js-function",
	slot:2,
	title: function(node){

		var title = "";

		if(!_.isUndefined(node.visibility) && node.visibility !== null && node.visibility !== "NULL"){
				visibility = node.visibility;
			}
			else{
				visibility = "-";
			}
			var attr = (node.rawValue !== null) && (node.rawValue !== "NULL") ? node.rawValue: "";
			return title+visibility+node.rawName + "("+attr+")";
	}
};

