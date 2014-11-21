var	esprima = require('esprima');
var	esquery = require('esquery');
var fs = require("graceful-fs");
var async = require("async");



module.exports = function javaScriptInspect(data, callback) {

		try{
			var ast = esprima.parse(data);
			var allVariables = esquery.match(ast, esquery.parse('[type="VariableDeclarator"]'));
			var allFunctions = esquery.match(ast, esquery.parse('[type="FunctionDeclarator"],[type="FunctionDeclaration"]'));
			var allProperties = esquery.match(ast, esquery.parse('[type="Property"]'));

			var variables = [];
			var functions = [];
			var objects = [];

			


			async.map(allVariables, function(variable,cbVar){	
				if(variable.init == null || (variable.init !== null && variable.init.type == "Literal" || variable.init.type == "CallExpression")){
					variables.push(variable.id.name);
				}
				else if(variable.init.type == "FunctionExpression"){
					functions.push(variable.id.name+"()");
				}
				else if(variable.init.type == "ObjectExpression"){
					objects.push(variable.id.name);
				}
			  cbVar(null,"");										    		
			},function(err,variableList){
				if(err){
					console.log("javaScriptInspect.js",err);
				}	
				async.map(allProperties, function(property,cbProp){
					try{
						if(property.value.type == "FunctionExpression"){
							functions.push(property.key.name+"()");
						}
					}
					catch(e){}
					cbProp(null,"");		
				},function(err,functionList){
					async.map(allFunctions, function(variable,cbVar){
						functions.push(variable.id.name+"()");							
					  	cbVar(null,"");										    		
					},function(err,functionList){
						callback(err,{"variables":variables,"functions":functions, "objects":objects});
					});
				});	
			});	 
		}catch(e){
			callback(null,{"variables":[],"functions":[], "objects":[]});
		};			
		 

};


