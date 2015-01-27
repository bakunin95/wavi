var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "HTML",
	active: true,
	priority:10,
	color:"lavenderblush",
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
			return node.name;
		}
	}
	]
};