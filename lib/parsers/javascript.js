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
			return node.rawName;
		}
	},
	{
		group:"js-function",
		slot:2,
		active: true,
		priority:50,
		title:function(node){
			return node.rawName;
		}
	}
	]
};