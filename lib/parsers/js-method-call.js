var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Call",
	active: true,
	priority:10,
	color:"darksalmon",
	slot:2,
	group:"js-method-call",
	title: function(node){
		
		var title = "Call@"+JSON.parse(node.loc).start.line+": "+node.rawName;

		if(node.rawValue !== "NULL" && node.rawValue !== ""){
			title += "("+node.rawValue+")";
		}
		else{
			title += "()";
		}

		return title;
	}
};
