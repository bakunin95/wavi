var fs = require("graceful-fs"),
    async = require("async"),
	CSSLint = require('csslint').CSSLint,
    _ = require('underscore')._;

var libCSS = module.exports = {
	    getReport: function (file,cbCss) {
	        fs.readFile( file, 'utf-8', function( err, data) {
	        	libCSS.errorHandler(err); 
		 		results = CSSLint.verify(data);			
		 		_.each(results.messages, function (message,key) {				    		
					results.messages[key].evidence = null;
					results.messages[key].rule = null;	
					results.messages[key].message = module.exports.removeSpecialChar(results.messages[key].message);    		
				});
				cbCss(err,results.messages);
		 	});	 	
	    },
	    findAssets: function(node,data){
			return [node,null];
	    },
	    removeSpecialChar: function(str){
	    	if(str !== null && _.isUndefined(str) == false){
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
	                      .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\\\/]/gi, '');
            }
            return str;
	    },
	    errorHandler: function(err){
			if(err){
				err.file =  "libCSS.js";
				console.log("Error",err);
			}
		}
};