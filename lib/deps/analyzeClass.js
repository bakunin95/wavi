var fs = require("graceful-fs"),
	scan = require("./utilities/scan"),
    async = require("async"),
    libCSS = require("./languages/libCSS.js"),
    libHTML = require("./languages/libHTML.js"),
    libJavaScript = require("./languages/libJavaScript.js"),
    _ = require('underscore')._;

var analyseReportClass = module.exports = {
		attachReports: function(relations,cbAnalyseReport){
			if(_.isUndefined(relations) == false){
				relations = JSON.parse(relations);
				relations.info = {};
				var relationsWithReport = new Array();
				async.map(relations.nodes, function(node,cb) {

					if(node.exist !== true){
						cb(null,node);		
						return;
					}

					switch(node.group){
						/*case 1:
							
							libHTML.getReport(node.name,function(err,report){
									node.report = report;
									node.reportCount = node.report.length;
									cb(err,node);
							});
							
						break;*/
						case 2:
							
							libJavaScript.getReport(node.name,function(err,report){
								analyseReportClass.errorHandler(err);
								node.composition = report.composition;
								node.report = report.report;
								node.reportCount = node.report.length;
								libJavaScript.getComplexiteAnalyse(node.name,function(err,complexityReport){
									analyseReportClass.errorHandler(err);
									if(complexityReport !== null){
										node.complexity = complexityReport;
									}
									cb(err,node);
								});	
							});
							
						break;
						case 3:

							libCSS.getReport(node.name,function(err,report){
								node.report = report;
								node.reportCount = node.report.length;
								cb(err,node);
							});	

						break;
						default:
							cb(null,node);
					}
					
					
				},function(err,result) {
					analyseReportClass.errorHandler(err);

					analyseReportClass.normalizeData(result,function(err,newNodes){
						analyseReportClass.errorHandler(err);
						relations.nodes = newNodes;			
						relations.info.groupCount = analyseReportClass.groupCount;
						cbAnalyseReport(err,JSON.stringify(relations));
					});


					
				});  
			}
			else{
				cbAnalyseReport(null,"");
			}

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
		normalizeData: function(data,cbNormalize){

			var dataMax = [];
			var aggregate = [];
			var halstead = [];
			halstead.operators = [];
			halstead.operands = [];
			var check = null;
			var row = null;

			analyseReportClass.groupCount = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0};


			async.map(data, function(node,cbData) {

				analyseReportClass.groupCount[node.group]++;

				if(node.group == 2 && _.isUndefined(node) == false && _.isUndefined(node.complexity) == false){

					row="cyclomatic";
					check = node.complexity.aggregate[row];
					if( aggregate[row] == null || aggregate[row] < check){
						aggregate[row] = check;
					}

					row="cyclomaticDensity";
					check = node.complexity.aggregate[row];
					if( aggregate[row] == null || aggregate[row] < check){
						aggregate[row] = check;
					}

					row="params";
					check = node.complexity.aggregate[row];
					if( aggregate[row] == null || aggregate[row] < check){
						aggregate[row] = check;
					}

					row="line";
					check = node.complexity.aggregate[row];
					if( aggregate[row] == null || aggregate[row] < check){
						aggregate[row] = check;
					}

					row="length";
					check = node.complexity.aggregate.halstead[row];
					if( halstead["lngth"] == null || halstead[row] < check){
						halstead["lngth"] = check;
					}

					row="vocabulary";
					check = node.complexity.aggregate.halstead[row];
					if( halstead[row] == null || halstead[row] < check){
						halstead[row] = check;
					}

					row="difficulty";
					check = node.complexity.aggregate.halstead[row];
					if( halstead[row] == null || halstead[row] < check){
						halstead[row] = check;
					}

					row="volume";
					check = node.complexity.aggregate.halstead[row];
					if( halstead[row] == null || halstead[row] < check){
						halstead[row] = check;
					}

					row="effort";
					check = node.complexity.aggregate.halstead[row];
					if( halstead[row] == null || halstead[row] < check){
						halstead[row] = check;
					}

					row="bugs";
					check = node.complexity.aggregate.halstead[row];
					if( halstead[row] == null || halstead[row] < check){
						halstead[row] = check;
					}

					row="time";
					check = node.complexity.aggregate.halstead[row];
					if( halstead[row] == null || halstead[row] < check){
						halstead[row] = check;
					}

					row="distinct";
					check = node.complexity.aggregate.halstead.operators[row];
					if( _.isUndefined(check) == false && (halstead.operators[row] == null || halstead.operators[row] < check)){
						halstead.operators[row] = check;
					}
					row="total";
					check = node.complexity.aggregate.halstead.operators[row];
					if( _.isUndefined(check) == false && (halstead.operators[row] == null || halstead.operators[row] < check)){
						halstead.operators[row] = check;
					}
					//if(_.isUndefined(node.complexity.aggregate.halstead.operands) == false && _.isUndefined(node.complexity.aggregate.halstead.operands.distinct) == false){
						row="distinct";
						check = node.complexity.aggregate.halstead.operands[row];
						if( _.isUndefined(check) == false && (halstead.operands[row] == null || halstead.operands[row] < check)){
							halstead.operands[row] = check;
						}
						row="total";
						check = node.complexity.aggregate.halstead.operands[row];
						if( _.isUndefined(check) == false && (halstead.operands[row] == null || halstead.operands[row] < check)){
							halstead.operands[row] = check;
						}
					//}
					row="bugs";
					check = node.complexity.aggregate.halstead[row];
					if( halstead[row] == null || halstead[row] < check){
						halstead[row] = check;
					}

					row="maintainability";
					check = node.complexity[row];
					if( dataMax[row] == null || dataMax[row] < check){
						dataMax[row] = check;
					}

					row="functions";
					check = node.complexity[row];
					if( dataMax[row] == null || dataMax[row] < check){
						dataMax[row] = check;
					}

					row="params";
					check = node.complexity[row];
					if( dataMax[row] == null || dataMax[row] < check){
						dataMax[row] = check;
					}




					
		
				}
				if(_.isUndefined(node) == false && _.isUndefined(node.reportCount) == false){
				row="reportCount";
					check = node.reportCount;
					if( dataMax[row] == null || dataMax[row] < check){
						dataMax[row] = check;
					}
				}
				cbData(null,"val");
			},function(err,result) {
				analyseReportClass.errorHandler(err);
				aggregate.halstead = halstead;
				dataMax.aggregate = aggregate;

				async.map(data, function(node,cbComplexNorm) {

						node.complexityNormalyzed = {};
					
					if(node.group == 2 && _.isUndefined(node) == false && _.isUndefined(node.complexity) == false){
						
						node.complexityNormalyzed.sloc = {};
						node.complexityNormalyzed.aggregate = {};
						node.complexityNormalyzed.aggregate.halstead = {};
						node.complexityNormalyzed.aggregate.halstead.operators = {};
						node.complexityNormalyzed.aggregate.halstead.operands = {};

						node.complexityNormalyzed.maintainability = node.complexity.maintainability / dataMax.maintainability;
						node.complexityNormalyzed.functions = node.complexity.functions / dataMax.functions;

						node.complexityNormalyzed.params = node.complexity.params / dataMax.params;
						node.complexityNormalyzed.aggregate.cyclomatic = node.complexity.aggregate.cyclomatic / dataMax.aggregate.cyclomatic;
						node.complexityNormalyzed.aggregate.params = node.complexity.aggregate.params / dataMax.aggregate.params;
						node.complexityNormalyzed.aggregate.line = node.complexity.aggregate.line / dataMax.aggregate.line;
						node.complexityNormalyzed.aggregate.cyclomaticDensity = node.complexity.aggregate.cyclomaticDensity / dataMax.aggregate.cyclomaticDensity;

						node.complexityNormalyzed.aggregate.halstead.lngth = node.complexity.aggregate.halstead["lentgh"] / dataMax.aggregate.halstead.lntgh;
						node.complexityNormalyzed.aggregate.halstead.vocabulary = node.complexity.aggregate.halstead.vocabulary / dataMax.aggregate.halstead.vocabulary;
						node.complexityNormalyzed.aggregate.halstead.difficulty = node.complexity.aggregate.halstead.difficulty / dataMax.aggregate.halstead.difficulty;
						node.complexityNormalyzed.aggregate.halstead.volume = node.complexity.aggregate.halstead.volume / dataMax.aggregate.halstead.volume;
						node.complexityNormalyzed.aggregate.halstead.effort = node.complexity.aggregate.halstead.effort / dataMax.aggregate.halstead.effort;
						node.complexityNormalyzed.aggregate.halstead.bugs = node.complexity.aggregate.halstead.bugs / dataMax.aggregate.halstead.bugs;
						node.complexityNormalyzed.aggregate.halstead.time = node.complexity.aggregate.halstead.time / dataMax.aggregate.halstead.time;
					
						node.complexityNormalyzed.aggregate.halstead.operators.distinct = node.complexity.aggregate.halstead.operators.distinct / dataMax.aggregate.halstead.operators.distinct;
						node.complexityNormalyzed.aggregate.halstead.operators.total = node.complexity.aggregate.halstead.operators.total / dataMax.aggregate.halstead.operators.total;

						node.complexityNormalyzed.aggregate.halstead.operands.distinct = node.complexity.aggregate.halstead.operands.distinct / dataMax.aggregate.halstead.operands.distinct;
						node.complexityNormalyzed.aggregate.halstead.operands.total = node.complexity.aggregate.halstead.operands.total / dataMax.aggregate.halstead.operands.total;


					}

					node.complexityNormalyzed.reportCount = node.reportCount / dataMax.reportCount;

					cbComplexNorm(null,node);
				},function(err,result2) {
					analyseReportClass.errorHandler(err);
					cbNormalize(err,result2);
				});  
			});  

		},
		errorHandler: function(err){
			if(err){
				err.file =  "analyseReportClass.js";
				console.log("Error",err);
			}
		}

};