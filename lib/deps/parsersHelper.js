var  _ = require('underscore')._;

var parsersHelper = module.exports = {
	reduceLength: function(name,maxLength){
		if(typeof name == "string" && name.length > maxLength){
			return name.substr(0,maxLength);

		}
		else{
			return name;
		}
	},
	removeSpecialChar: function(str){
	    	if(str !== null && _.isUndefined(str) === false){
		    	var str = str.replace(/\\n/g, "\\n")
	                      .replace(/\\'/g, "\\'")
	                      .replace(/\\"/g, '\\"')
	                      .replace(/\\&/g, "\\&")
	                      .replace(/\\r/g, "\\r")
	                      .replace(/\\t/g, "\\t")
	                      .replace(/\\b/g, "\\b")
	                      .replace(/\\f/g, "\\f")
	                      .replace(/\\\//g, "/")
	                      .replace( /([^\x00-\xFF]|\s)*$/g, '')
	                    //  .replace(/[`~!@$%^&*|+=?;'"<>\\\/]/gi, '');
	                      .replace(/[`~!@#$%^&*()_|=?;'",\{\}.<>\\\/]/gi, '')
	                      .replace(/\W/g, '');
            }



            //.replace(/\W/g, '');


            	                      //.replace(/[`~!@$%^&*_|+\-=?;'"<>]/gi, '');
	                      //.replace(/[`~!@$%^&#.*_|+\-=?;'"<>]/gi, '');
            return str;
	},
};
