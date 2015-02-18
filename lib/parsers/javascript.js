var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript",
	active: true,
	priority:10,
	color:"aliceblue",
	group:"js",
	title: function(node){
		
		return node.name;
	},
	attributes:[
	{
		group:"js-variable",
		slot:1,
		active: true,
		priority:50,
		title:function(node){

			var name = node.rawName;
			if(!_.isUndefined(node.rawType) && node.rawType !== null){
				name = node.rawType+" "+name;
			}
			if(!_.isUndefined(node.rawValue) && node.rawValue !== null){
				name = name+": "+parsersHelper.removeSpecialChar(parsersHelper.reduceLength(node.rawValue,15));
			}
			return name;
		}
	},
	{
		group:"js-function",
		slot:2,
		active: true,
		priority:50,
		title:function(node){
			var attr = (node.rawValue !== null) ? node.rawValue: "";
			return node.rawName + "("+attr+")";
		}
	}
	]
};