var fs = require("graceful-fs"),
    async = require("async"),
    _ = require('underscore')._,
    util = require('util'),
    parsersLib = require('./parsersLib'),
    aggregatorClass = require('./aggregatorClass'),
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
					cb();
				},
				function(cb){

					aggregatorClass.aggregateList(schema,cb);
				},
				function(cb){
					var usecluster = false;

					parsersLib.processList(Node,Link,function(err,newNodes,newLinks){
						
						var allTargets = _.unique(_.union(_.pluck(newLinks,"target"),_.pluck(newLinks,"target")));
						var startingGroup = ["js","css","html"];

						async.each(newNodes, function(currentNode,cbNode) {

							if(_.contains(startingGroup,currentNode.group) || _.contains(allTargets,currentNode.id)){
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
			       						try{
				       						attr = JSON.parse(currentLink.type);
				       						if(attr.label){
				       							attr.label = "«"+attr.label+"»";
				       						}
			       						}catch(e){
											attr = null;
			       						}

								g.addEdge( "n"+currentLink.source, "n"+currentLink.target,attr);//attr
								cbLink();
							},cb);
						});
					});

				}
		    ], function done(err, results) {
		    	graphvizClass.errorHandler(err);

				g.use = "fdp";
				//g.set("overlap","false");
				g.set("splines","ortho");
				//g.set("rankdir","TB");
				//g.set("sep","4");
				g.set("nodesep","4");

    			try{
					g.output( type, path ,function(err,err1,err2){
						

						
						cbgenGraph(err2,"");
					},function(err){
						console.log("error",err)
					});	
				}catch(e){
					if(e.code === "EPIPE"){
						console.log("###########################################################################");
						console.log("Error: Require Graphviz 2.38 or later");
						console.log("Graphviz is not installed, too old or the os environment path is not set proprely");
						console.log("Graphviz download:  http://www.graphviz.org/Download.php")
						console.log("Add Graphviz bin folder to environment variable path (ex.: 'C:\Program Files (x86)\Graphviz2.38\bin')");
						console.log("###########################################################################");
					}
					else{
						graphvizClass.errorHandler(e);
					}	
    			}	


		    });	
		},
		errorHandler: function(err){
			if(err){
				console.log(err);
			}
		}
};