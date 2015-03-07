var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Object",
	active: true,
	priority:10,
	color:"CornflowerBlue",
	group:"js-object",
	title: function(node){
		//console.log(node);
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
			name = "+"+name;
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
			var attr = (node.rawValue !== null) ? node.rawValue: "";
			return "+"+node.rawName + "("+attr+")";
		}
	},
	{
		group:"js-method",
		slot:2,
		active: true,
		priority:50,
		title:function(node){
			return "+"+node.rawName;
		}
	}
	]
};