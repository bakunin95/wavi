var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "CSS",
	active: true,
	priority:10,
	color:"palegreen",
	group:"css",
	title: function(node){
		return node.name;
	},
	attributes:[
	{
		group:"css-rule",
		slot:1,
		active: true,
		priority:50,
		title:function(node){
			//var name = parsersHelper.reduceLength(node.rawName,35).replace(" ", 'h9Kj5f').replace(".", 'c3C93k').replace("#", 'z9Z34k').replace(/\W/g, '').replace("z9Z34k", '#').replace("c3C93k", '.').replace('h9Kj5f'," ");
			//var name = parsersHelper.reduceLength(node.rawName,35).replace(/\W/g, ' ');
			var name = parsersHelper.reduceLength(node.rawName,35);
			return name;	
		}
	}
	]
};