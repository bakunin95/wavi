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
		return node.rawName;
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
	},
	{
		group:"js-method",
		slot:2,
		active: true,
		priority:50,
		title:function(node){
			return node.rawName;
		}
	}
	]
};