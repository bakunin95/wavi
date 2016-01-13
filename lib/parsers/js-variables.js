var async = require("async"),
	_ = require('underscore')._;

var parsersHelper = require("../deps/parsersHelper");

module.exports = {
	stereotype: "JavaScript Variable",
	active: true,
	priority:10,
	color:"moccasin",
	group:"js-variable",
	title: function(node){
		var name = node.rawName;
			name = "+"+name;
			if(!_.isUndefined(node.rawType) && node.rawType !== null && node.rawType !== "NULL"){
				name = name+" : "+node.rawType.toLowerCase();
			}
			else{
				name = name+" : variable";
			}

			if(!_.isUndefined(node.rawValue) && node.rawValue !=="" && node.rawValue !== null && node.rawValue !== "NULL"){
				var parsedVal = parsersHelper.removeSpecialChar(parsersHelper.reduceLength(node.rawValue,15));
				
					if(parsedVal !== null && parsedVal !== ""){
						name = name+" = "+parsedVal;
					}
				
			}
			
			return name;
	}	
};
