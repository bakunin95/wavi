var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Array",
	active: true,
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
			var name = parsersHelper.reduceLength(node.rawName,35);

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