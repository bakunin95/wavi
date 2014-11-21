var fs = require("graceful-fs"),
    async = require("async"),
    path = require("path"),
	escomplexjs = require('escomplex-js'),
	esprima = require('esprima'),
	estraverse = require('estraverse'),
	esquery = require('esquery'),
	detective = require('detective'),
	detectiveAmd = require('detective-amd'),
	jslint = require('../utilities/jslint-latest.js'),
	javaScriptInspector = require('../inspectors/javaScriptInspector.js'),
    _ = require('underscore')._;


var libJavaScript = module.exports = {
	    getReport: function (file,cbJsLint) {
	    	//Generate jslint report
		    fs.readFile( file, 'utf-8', function( err, data) {
		       	libJavaScript.errorHandler("getReport",err);
		    	try{
			       	javaScriptInspector(data,function(err,inspection){
			       		libJavaScript.errorHandler(err);
			    		if(data !== null){
			    			try{
								jslint.JSLINT(data);			
								var results = jslint.JSLINT.data().errors;
								_.each(results, function (val,key) {
									if(val !== null && val.evidence !== null){
										results[key].evidence == null
										delete results[key].evidence;
										results[key].message = libJavaScript.removeSpecialChar(results[key].message);    		
									}
									else{
										results.splice(key,key);
									}
								});
								cbJsLint(err,{"report":results,"composition":inspection});
							}
							catch(e){
								libJavaScript.errorHandler("javaScriptInspector",e);
								cbJsLint(err,"");
							}
						}
						else{
							cbJsLint(err,"");
						}
					});
				}catch(e){
					libJavaScript.errorHandler("getReportTryCatch",e);
					cbJsLint(err,{"report":[],"composition":{"variables":[],"functions":[], "objects":[]}});
				}
	        });

	    },
	    findAssets: function(node,data,cbFindAssets){
	    	//find assets in JavaScript file
	    	async.parallel({
			    detective: function(callback) {

			    	var res = null;
			    	try{
		    			res = detective(data);
		    		}
		    		catch(e){
		    			//detective can't parse this file
		    		}
			        callback(null, res);
			    },
			    detectiveAmd: function(callback) {
			    	var res = null;
			    	try{
		    			res = detectiveAmd(data);
		    		}
		    		catch(e){
		    			//detectiveAmd can't parse this file
		    		}
			        callback(null, res);
			    },
			    ajax: function(callback) {
			    	try{		    		
				    	libJavaScript.assetAjax(data,function(err,results){
				    		callback(null,results);
				    	});
			    	}
		    		catch(e){
		    			libJavaScript.errorHandler("ajax",e);
		    			callback(null,[]);
		    		}

			    }
			}, function(err, results) {
				libJavaScript.errorHandler(err);

				var assetsMerge = null;
				if(_.isUndefined(results) == false){
					assetsMerge = _.reject(_.flatten(results),_.isUndefined);
				}

				var assets = new Array();
				for (key in assetsMerge) {
					if(assetsMerge[key] !== null && _.isUndefined(assetsMerge[key]) == false){
						assets.push({"name":assetsMerge[key]});	   		
					}
				}

			   cbFindAssets(null,[node,assets]);
			});
	    },
	    getComplexiteAnalyse: function (file,cbCp){
	    	//generate complexity
	    	fs.readFile(file, 'utf-8', function( err, data) {
	    		libJavaScript.errorHandler("getComplexiteAnalyse",err);
	    		var analyse = null;
	    		try{
			    	analyse = escomplexjs.analyse(data);

			    	if(analyse !== null){

			    		analyse.aggregate.halstead.time = analyse.aggregate.halstead.time/60/60;

			    		if(_.isUndefined(analyse.aggregate.halstead.operators) == false){
			    			delete analyse.aggregate.halstead.operators.identifiers;
			    		}

			    		if(_.isUndefined(analyse.aggregate.halstead.operands) == false){
			    			delete analyse.aggregate.halstead.operands.identifiers;
			    		}

			    		if(_.isUndefined(analyse.functions) == false){
			    			analyse.functions = analyse.functions.length;
			    		}
			    		
					}
				}	
				catch(e){
					libJavaScript.errorHandler(e);
				}
				cbCp(err,analyse);
			});		
	    },
	    assetAjax: function(data,cbAssetAjax){

	    	try{
		    	var ast = esprima.parse(data);
				var selectorAst = esquery.parse('[callee.property.name="ajax"][callee.object.name="$"]');
				var ajaxResult = esquery.match(ast, selectorAst);
				var assets = new Array();
				if(ajaxResult.length>0){
					for (key in ajaxResult) {
						if(ajaxResult[key] !== null){
							if(_.isUndefined(ajaxResult[key].arguments[0].value) === false){
								assets.push(ajaxResult[key].arguments[0].value);	   		
							}
						}
					}
				}
			}catch(e){
	    		libJavaScript.errorHandler(e); 		    		
	    	}

			async.parallel({
			    isAjax:function(callback) {
			    	try{
				    	var selectorAst = esquery.parse('[callee.object.name="$"][callee.property.name="ajax"]');			
						var ajaxResult = esquery.match(ast, selectorAst);
						var assets = new Array();

						if(ajaxResult.length>0){
							for (key in ajaxResult) {
								if(ajaxResult[key] !== null){
									if(_.isUndefined(ajaxResult[key].arguments[0].value) == false){
										assets.push(ajaxResult[key].arguments[0].value);	   		
									}
								}
							}
						}
					}
					catch(e){}
			        callback(null, assets);
			    },
			    isGetScript:function(callback) {
			    	try{
				    	var selectorAst = esquery.parse('[callee.object.name="$"][callee.property.name="getScript"]');			
						var ajaxResult = esquery.match(ast, selectorAst);
						var assets = new Array();

						if(ajaxResult.length>0){
							for (key in ajaxResult) {
								if(ajaxResult[key] !== null){
									if(_.isUndefined(ajaxResult[key].arguments[0].value) == false){
										assets.push(ajaxResult[key].arguments[0].value);	   		
									}
								}
							}
						}
					}
					catch(e){}
			        callback(null, assets);
			    },
			     isLoad:function(callback) {
			     	try{
				    	var selectorAst = esquery.parse('[callee.object.callee.name="$"][callee.property.name="load"]');			
						var ajaxResult = esquery.match(ast, selectorAst);
						var assets = new Array();

						if(ajaxResult.length>0){
							for (key in ajaxResult) {
								if(ajaxResult[key] !== null){
									if(_.isUndefined(ajaxResult[key].arguments[0].value) == false){
										assets.push(ajaxResult[key].arguments[0].value);	   		
									}
								}
							}
						}
					}
					catch(e){}
			        callback(null, assets);
			    }







			    /*,
			    isJson:function(callback) {
			    	var selectorAst = esquery.parse('[callee.object.name="$"][callee.property.name="getJSON"]');			
					var ajaxResult = esquery.match(ast, selectorAst);
			        callback(null, ajaxResult);
			    },
			    isApp:function(callback) {
			    	var selectorAst = esquery.parse('[callee.object.name="app"][callee.property.name="get"]');			
					var ajaxResult = esquery.match(ast, selectorAst);
			        callback(null, ajaxResult);
			    }*/
			}, function(err, results) {
				libJavaScript.errorHandler(err);
				
				var resFinal = null;
				if(_.isUndefined(results) == false){
					resFinal = _.reject(_.flatten(results),_.isUndefined);

					
				}
				cbAssetAjax(null,resFinal);

			});

			return assets;
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
	    errorHandler: function(func,err){
			if(err){
				err.file =  "libJavaScript.js";
				err.func = func;
				console.log("Error",err);
			}
		}
};