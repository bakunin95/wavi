var fs = require("graceful-fs"),
    async = require("async"),
    _ = require('underscore')._,
    util = require('util'),
    parsersLib = require('./parsersLib'),
    graphviz = require('graphviz');

    var proc1 = require('child_process');

    var Link;
	var Node;
	var linkSchema = require("../models/link.js")
	var nodeSchema = require("../models/node.js")
	


var graphvizClass = module.exports = {
	clusters: [],
		generateGraph: function(grapheJSON,type,path,generateDot,cbgenGraph){
			
			var g = graphviz.digraph("G");

			var nodes = JSON.parse(grapheJSON).nodes;
			var links = JSON.parse(grapheJSON).links;

			var Schema = require('jugglingdb').Schema;
			var schema = new Schema('sqlite3', {
			    database: ':memory:'
			});

			Link = linkSchema(schema);	
			Node = nodeSchema(schema);

		



			//console.log(nodes);

			async.series([ 
				function(cb){
					schema.automigrate(function(msg){
						cb();
					}); 
				},
				function(cb){
					async.each(nodes,function(node,cbAddDb){
						Node.create(node,cbAddDb);
					},cb);
				},
				function(cb){
					async.each(links,function(link,cbAddDb){
						Link.create(link,cbAddDb);
					},cb);
				},
				function(cb){

					delete nodes;
					delete links;
					cb();
				},
				function(cb){
					//check if should be a child or not
					Node.iterate({batchSize: 10}, function(obj, next, i) {


					//Node.all({},function(err,nodes) {

						/*Link.all({where :{source:obj.id}},function(err,currentLink){
							if(currentLink.group == "")
						});*/


						if(obj.group === "js-object" || obj.group ==="js-function"){
							Link.count({source:obj.id},function(err,count){
								if(count == 0){									
									obj.updateAttribute('isChild', "true", next);
								}
								else{
									obj.updateAttribute('isChild', "false", next);
								}
							});						
						}
						else{
							next();
						}





					}, function(err) {
					    cb();
					});

				},
				function(cb){
					var usecluster = false;
					parsersLib.processList(Node,Link,function(err,newNodes,newLinks){
						async.each(newNodes, function(currentNode,cbNode) {

							if(usecluster == true){
								
								if(currentNode.rootParentId !== null){


									
									if(_.isUndefined(graphvizClass.clusters[currentNode.rootParent]) ){
										var cluster = g.addCluster("cluster_"+currentNode.rootParentId);
										
										cluster.set( "style", "filled" );
										cluster.set( "color", "gray28" );
										cluster.set( "fillcolor", "gray90" );
										cluster.set( "label", "[inside "+currentNode.rootParent+"]" );

										graphvizClass.clusters[currentNode.rootParent] = cluster;
										graphvizClass.clusters[currentNode.rootParent].addNode("n"+currentNode.id, currentNode.data);

									}
									else{
										graphvizClass.clusters[currentNode.rootParent].addNode("n"+currentNode.id, currentNode.data);
									}
								}
								else{
									g.addNode("n"+currentNode.id, currentNode.data);
								}
							}
							else{
								g.addNode("n"+currentNode.id, currentNode.data);
							}

							



							




							cbNode();
						},function(err){

							var groups = _.groupBy(newLinks, function(value){
						        return value.source + '#' + value.target;
						    });

						    var groupedLinks = _.map(groups, function(group){
						        return {
						            source: group[0].source,
						            target: group[0].target,
						            type: _.pluck(group, 'type')
						        }
						    });

							async.each(groupedLinks, function(currentLink,cbLink){
								var attr = {};
								/*if(link.type !== null){
			       						attr = {"label":"«"+link.type+"»"};
			       					}*/

								g.addEdge( "n"+currentLink.source, "n"+currentLink.target,attr);
								cbLink();
							},cb);


						});
					});

				}
		    ], function done(err, results) {
		    	graphvizClass.errorHandler(err);
		    	g.use = "sfdp";
				//g.set("sep","+25,25");
				g.set("splines","compound");
				//g.set("nodesep",0.6);
				g.set("overlap","false");
				g.set("rankdir","TB");
				g.set("sep",".3");
				//g.set("splines","compound");
				//g.set("maxiter",1000);
				//g.set("quadtree","fast");

				//sfdp -x -Goverlap=prism -Tsvg

				if(type === "archvis"){
					
					fs.writeFile("app/data/classDiagram.dot", g.to_dot(), function(err) {
						graphvizClass.errorHandler(err);
						//-x -Goverlap=false
						proc1.exec('sfdp -Goverlap=false -Tsvg app/data/classDiagram.dot -o '+path+'.svg', function (error, stdout, stderr) {
					    	cbgenGraph(error,"");
				       	}).unref();	
					});



					try{
						//"app/data/classDiagram.svg",
						/*g.output( "svg", function(file){
							fs.writeFile("app/data/classDiagram.svg", file, function(err) {
								cbgenGraph(null,"");
							});
						});*/
						
						/*
						g.output( "svg", "app/data/classDiagram.svg" ,function(err){
											console.log(err);

							graphvizClass.errorHandler(err);
							console.log("Error in graphvizClass",err);
							cbgenGraph(err,"");
						});*/
					}
					catch(e){
/*
						console.log("Wavi could not generate a graph, make sure Graphviz is installed and path variable is set up correctly in your environnment variable");
						cbgenGraph(e,"");*/
					}		


				}
				else{

		    		try{
						g.output( type, path ,function(err){
							if(err === 1){
								g.use = "circo";
								g.output( type, path ,function(err){	
									graphvizClass.errorHandler(err);
									console.log("Error in graphvizClass",err);
									cbgenGraph(err,"");
								});
							}else{


								graphvizClass.errorHandler(err);
								console.log("Error in graphvizClass",err);
								cbgenGraph(err,"");
							}
						});
					}
					catch(e){
						console.log("Wavi could not generate a graph, make sure Graphviz is installed and path variable is set up correctly in your environnment variable");
						cbgenGraph(e,"");
					}				

				}
		    });	
		},
		errorHandler: function(err){
			if(err){
				console.log("Error in graphvizClass",err);
			}
		}
};