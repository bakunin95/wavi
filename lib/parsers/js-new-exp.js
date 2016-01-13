var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Object Instance",
	active: true,
	priority:10,
	color:"DeepPink1",
	group:"js-new-exp",
	title: function(node){
		//console.log(node);
		return node.rawName;
	}
};