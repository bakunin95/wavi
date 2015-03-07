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
			if(!_.isUndefined(node.visibility) && node.visibility !== null && node.visibility !== "NULL"){
				name = node.visibility+name;
			}
			else{
				name = "+"+name;
			}
			if(!_.isUndefined(node.rawType) && node.rawType !== null){
				name = name+" : "+node.rawType;
			}
			if(!_.isUndefined(node.rawValue) && node.rawValue !=="" && node.rawValue !== null && node.rawValue !== "NULL"){
				var value = parsersHelper.removeSpecialChar(parsersHelper.reduceLength(node.rawValue,15));

				if(value !== ""){
					name = name+" = "+value;
				}
			}
			return name;
		}
	},
	{
		group:"js-array",
		slot:1,
		active: true,
		priority:50,
		title:function(node){
			var name = node.rawName+" : Array";;
			return name;
		}
	},
	{
		group:"js-object",
		slot:1,
		active: true,
		priority:50,
		title:function(node){
			return node.rawName+" : object";
		}
	},
	{
		group:"js-function",
		slot:2,
		active: true,
		priority:50,
		title:function(node){
			var attr = (node.rawValue !== null) ? node.rawValue: "";
			if(!_.isUndefined(node.visibility) && node.visibility !== null && node.visibility !== "NULL"){
				visibility = node.visibility;
			}
			else{
				visibility = "+";
			}
			return visibility+node.rawName + "("+attr+")";
		}
	}	
	]
};