var fs = require("graceful-fs"),
    async = require("async"),
    _ = require('underscore')._;

var Link;
var Node;
var linkSchema = require("../models/link.js");
var nodeSchema = require("../models/node.js");
var json2csv = require('json2csv');

var aggregatorClass = module.exports = {
	aggregateList: function(schema,cb){
		Link = linkSchema(schema);	
		Node = nodeSchema(schema);
		Node.iterate({batchSize: 1,order:'id ASC'}, function(obj, next, i) {
				Link.all({where:{target:obj.id}, group:1},function(err,sources){
					Link.all({where:{source:obj.id, group:1}},function(err,targets){
						var targetList = _.pluck(targets,"target");
						var sourcesList = _.pluck(sources,"source");
						Node.all({where:{id:{inq:targetList}}},function(err,childList){
							Node.all({where:{id:{inq:sourcesList}}},function(err,parentList){
								var parentisRemoveAll = _.unique(_.pluck(parentList,"isChild"));
								var analysisType = "newWay";
								switch (analysisType){
									case "hierarchy":
										if(obj.hierarchyElement > 1 ){
											obj.mode = 3;
											obj.save(next);	
										}
										else{
											next();
										}	
									break;
									case "newWay":
										aggregatorClass.selectMode(obj,parentList,childList,next);
									break;

									case "allChilds":
										obj.mode = 1;
										obj.save(next);	
									break;
									default:
										parsers[obj.group].aggregate(obj,parentList,childList,next);
								}
							});							
						});
					});	
				});
		}, function(err) {
			aggregatorClass.aggregateLinks(cb);

		});
	},
	aggregateLinks: function(cb){
		var allModes =[0,0,0,0];
		Node.iterate({batchSize: 1,order:'id DESC'}, function(node, next, i) {
			Link.all({where:{source:node.id}},function(err,targets){
				var targetList = _.pluck(targets,"target");
				Node.all({where:{id:{inq:targetList}}},function(err,nodeList){
					async.each(nodeList,function(attrNode,cbNodeList){
						if(attrNode.mode === 4){
							async.parallel([
							    function(cbPar1){ 
							    	Link.all({where : {source: attrNode.id, target:{ nin:[node.id]}, group:1}},function(err,targetList){
										async.each(targetList,function(target,cbTarget){
											target.updateAttribute('source', node.id, cbTarget);
										},cbPar1);				
									});
							    },
							    function(cbPar2){
							    	Link.all({where : {target: attrNode.id, source:{ nin:[node.id]}, group:1}},function(err,targetList){
										async.each(targetList,function(target,cbTarget){
											target.updateAttribute('target', node.id, cbTarget);
										},cbPar2);				
									});
							    }
							], function(){
								cbNodeList();
							});
						}
						else{
							cbNodeList();
						}
					},function(){
						allModes[node.mode-1] +=1;
						next();
					});
				});
			});
		}, function(err) {
			allModes[2] = allModes[3];
			delete allModes[3];
			//aggregatorClass.generateFilterReport(cb);
			cb();
		});
	},
	generateFilterReport: function(cb){
		var system = program_args[0];
		Node.all({},function(err,nodeList){
			var Groups = [];
			async.each(nodeList,function(node,cbNode){
				Groups
			},function(){

			});
			json2csv({data: nodeList ,fields: ['rootParent','group','mode','visElem','filterValue','rawName',"name",'rawValue','rawType','visibility','hierarchyFile','hierarchyElement','loc','parsedBy']}, function(err, csv) {
				console.log("did filter report");
				fs.writeFile("D:/RESULT/"+system+".csv", csv,"utf8", cb);
			});
		});
	},
	selectMode: function(node,parentList,childList,cbMode){
			var parentGroup = _.unique(_.pluck(parentList,"group"));
			var parentMode = _.unique(_.pluck(parentList,"mode"));
			var parentisChild = _.unique(_.pluck(parentList,"isChild"));
			var childGroup = _.unique(_.pluck(childList,"group"));
			var hierarchyFile = node.hierarchyFile; 						
			var hierarchyElement = node.hierarchyElement;		
			var isAnonymous = (node.rawValue !== null || !_.isUndefined(node.rawValue) || node.rawName === "anonymous-function") ? 1 : 0;  	
			var locInside = 1;
			try{
				var loc = JSON.parse(node.loc);
				locInside = loc.end.line - loc.start.line;
			}catch(e){}
																		
			var visibility = (node.visibility === "+") ? 1 : 0;
			var childElQty = childList.length;
			var childElIsFunc = _.where(childGroup,"js-function").length;
			var childElIsClass = _.where(childGroup,"js-class").length;
			var childElIsObject = _.where(childGroup,"js-object").length;
			var parentElQty = parentList.length;
			var isConstructor = 1;
			var elementGroup = node.group;
			var dimensions = [hierarchyFile,
							  hierarchyElement,
							  isAnonymous,
							  locInside,
							  visibility,
							  childElQty,
							  childElIsFunc,
							  childElIsClass,
							  childElIsObject,
							  parentElQty,
							  isConstructor,
							  parentMode,
							  elementGroup];

			var detail = 88;
			var densite = 70;
					
			var compacte = densite;
			detail = compacte - compacte * detail/100;
			var visibilityThreshold = [compacte,detail];
	
			aggregatorClass.filter(node,dimensions,visibilityThreshold,function(finalMode){
				if(finalMode === 4){
					async.each(childList,function(child,cbChild){
						child.mode = 4;
						child.save(cbChild);
					},cbMode);
				}
				else{
					cbMode();
				}
			});
	},
	filter: function(node,dimensions,visibilityThreshold,cb){
		var mode = 1; 
		var visibility = 0;
		
		if(node.rawName === "NULL" && dimensions[12] === "js-function"){
			visibility -= 10000;
		}
		if(node.mode !== 1){
			visibility -= 10000;
		}
		if(dimensions[12] === "js" || dimensions[12] === "html" || dimensions[12] === "css"){
			visibility += 1000;
		}

		// ### JavaScript Elements

		if(dimensions[12] === "js-markup"){
			visibility += 1000;
		}

		if(dimensions[12] === "js-class"){
			visibility += 1000;
		}

		if(dimensions[12] === "js-function"){
			visibility += 80;
		}
		if(dimensions[12] === "js-method"){
			visibility += 80;
		}
		if(dimensions[12] === "js-ajax"){
			visibility += 80;
		}
		if(dimensions[12] === "js-object"){
			visibility += 60;
		}
		if(dimensions[12] === "js-variable"){
			visibility += 50;
		}		
		if(dimensions[12] === "js-array"){
			visibility += 50;
		}
		
		if(dimensions[12] === "js-require"){
			//visibility += 40;
			visibility += 90;
		}
		if(dimensions[12] === "js-method-call"){
			visibility += 0;
		}

		if(node.rawName === "module.exports" && dimensions[12] === "js-function"){
			visibility = 90;
		}

		// ### HTML Elements
		if(dimensions[12] === "ajax"){
			visibility += 1000;
		}

		if(dimensions[12] === "html-markup"){
			visibility += 1000;
		}

		if(dimensions[12] === "html-element"){
			visibility += 50;
		}

		if(dimensions[12] === "form"){
			visibility += 140;
		}

		if(dimensions[12] === "form-element"){
			visibility += 50;
		}

		if(dimensions[12] === "email"){
			visibility += 50;
		}	

		if(dimensions[12] === "link"){
			visibility += 90;
		}

		if(dimensions[12] === "ws"){
			visibility += 80;
		}

		// ### CSS elements
		if(dimensions[12] === "css-markup"){
			visibility += 1000;
		}

		if(dimensions[12] === "css-rule"){
			visibility += 50;
		}

		//Public or Private
		if(dimensions[4] === 1){
			visibility += 5;
		}

		// Line of code inside
		if(dimensions[5] >= 10){
			visibility += 10;
		}
		else if(dimensions[5] >= 30){
			visibility += 20;
		}

		//Anon
		if(dimensions[2] === 1){
			visibility -= 5;
		}

		//hide unrelated 

		if(dimensions[5] >= 1){
			visibility += 20;
		}
		else{
			visibility -= 10;
		}

		if(dimensions[6] === 1 || dimensions[7] === 1 || dimensions[8] === 1){
			visibility += 40;
		}
		
		visibility -= dimensions[0]*0.5 + dimensions[1]*2;
		
		if(visibility > 100){
			visibility = 100;
		}
		else if(visibility < 0){
			visibility = 0;
		}

		//Select Mode

		if(visibility >= visibilityThreshold[0]){
			mode = 1;
		}
		else if(visibility >= visibilityThreshold[1]){
			mode = 2;
		}
		else{
			mode = 4;
		}

		if(_.contains(dimensions[11],4) || _.contains(dimensions[11],2)){
			mode = 4;
		}

		node.visElem = visibility;
		node.mode = mode;

		node.save(cb(mode));

	},
	getHighestMode: function(mode){


		var maxMode = _.max(mode);

		if(mode[0] >= maxMode){
			return 1;
		}
		else if(mode[1] >= maxMode){
			return 2;
		}
		else if(mode[2] >= maxMode){
			return 3;
		}
		else{
			return 4;
		}
	}
}