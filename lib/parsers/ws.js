var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "External HTML",
	active: true,
	priority:10,
	color:"Thistle",
	group:"html",
	title: function(node){
		return node.name;
	},
	attributes:[
	{
		group:"html-element",
		slot:1,
		active: true,
		priority:50,
		title:function(node){
			var name = node.rawName;
			if(!_.isUndefined(node.rawType) && node.rawType !== null && node.rawType !== "NULL" && (node.rawName !== node.rawType)){
				name = name+" : "+node.rawType;
			}

			node.rawValue = parsersHelper.removeSpecialChar(parsersHelper.reduceLength(node.rawValue,15));
			if(!_.isUndefined(node.rawValue) && node.rawValue !=="" && node.rawValue !== null && node.rawValue !== "NULL"){
				name = name+" = "+node.rawValue;
			}

			return name;
		}
	}
	]
};