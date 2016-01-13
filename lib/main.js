
'use strict';
var constants = require( './deps/utilities/constants' );
var fs = require('graceful-fs');
var relex = require('./extractor/index.js');
var graphvizClass = require('./deps/graphvizClass'); 

module.exports = function(program) {
	define( 'TEMPLATE_PATH', "app", this );
	define( 'WEBSITE_PATH', program.args[0], this );
	define( 'RESULT_PATH', program.args[1], this );

	var includenodemodules = false;
	if(program.includenodemodules == true){
		includenodemodules = true;
	}

	relex.extract(constants.WEBSITE_PATH,includenodemodules,function(err,report){	
		errorHandler(err);	

		var grapheJSON = JSON.stringify(report);

		console.log("generating graph (could take several minutes)...")


		if(program.jpg){
			graphvizClass.generateGraph(grapheJSON,"jpg",constants.RESULT_PATH,false,function(err){
				errorHandler(err)
			}); 
		}
		if(program.png){
			graphvizClass.generateGraph(grapheJSON,"png",constants.RESULT_PATH,false,function(err){
				errorHandler(err)
			}); 
		}
		if(program.svg){
			graphvizClass.generateGraph(grapheJSON,"svg",constants.RESULT_PATH,false,function(err){
				errorHandler(err)
			}); 
		}
		if(program.dot){
			graphvizClass.generateGraph(grapheJSON,"dot",constants.RESULT_PATH,false,function(err){
				errorHandler(err)
			}); 
		}
		if(program.pdf){
			graphvizClass.generateGraph(grapheJSON,"pdf",constants.RESULT_PATH,false,function(err){
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