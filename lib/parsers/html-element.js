var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "html-element",
	active: true,
	priority:10,
	color:"cyan1",
	slot:2,
	group:"html-element",
	title: function(node){
		return node.rawType+" "+node.rawName;
	}
};