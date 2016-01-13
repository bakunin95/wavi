var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Object Definition",
	active: true,
	priority:10,
	color:"PaleVioletRed",
	group:"js-object",
	title: function(node){
		//console.log(node);
		//return node.rawName;
		var name = node.rawName;
			name = "+"+name;
			if(!_.isUndefined(node.rawType) && node.rawType !== null){
				name = name+" : object";
			}
			if(!_.isUndefined(node.rawValue) && node.rawValue !=="" && node.rawValue !== null && node.rawValue !== "NULL"){
				name = name+" = "+parsersHelper.removeSpecialChar(parsersHelper.reduceLength(node.rawValue,15));
			}
			return name;
	}
};