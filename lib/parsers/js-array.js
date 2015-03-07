var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Array",
	active: false,
	priority:10,
	color:"DodgerBlue",
	group:"js-array",
	title: function(node){
		return node.rawName;
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
				name = name+" : "+node.rawType;
			}
			if(!_.isUndefined(node.rawValue) && node.rawValue !=="" && node.rawValue !== null && node.rawValue !== "NULL"){
				name = name+" = "+parsersHelper.removeSpecialChar(parsersHelper.reduceLength(node.rawValue,15));
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
			var name = parsersHelper.reduceLength(node.rawName,35);

			return name;
		}
	},
	{
		group:"js-method",
		slot:2,
		active: true,
		priority:50,
		title:function(node){
			var name = parsersHelper.reduceLength(node.rawName,35);

			return name;
		}
	}
	]
};