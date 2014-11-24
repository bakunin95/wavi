var relex = require('relex');
var graphvizClass = require('./lib/deps/graphvizClass');

exports.generateGraph = function(type,website_path,result_file,skipnodemodules,callback) {

	relex.extract(website_path,skipnodemodules,function(err,report){	
		errorHandler(err);	

		if(type == "jpg" || type == "png" || type == "svg" || type == "dot" || type == "pdf"){
			graphvizClass.generateGraph(JSON.stringify(report),type,result_file,false,function(err){
				errorHandler(err)
			}); 
		}
	});	

	function errorHandler(err){
		if(err){
			console.log("Error (main.js):",err);
		}	
	}

};