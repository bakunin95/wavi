var fs = require("graceful-fs"),
    async = require("async"),
    Datastore = require('nedb'),
    _ = require('underscore')._,
    util = require('util'),
    parsersLib = require('./parsersLib'),
    graphviz = require('graphviz');

    var proc1 = require('child_process');



var graphvizClass = module.exports = {
	clusters: [],
		generateGraph: function(grapheJSON,type,path,generateDot,cbgenGraph){
			
			var g = graphviz.digraph("G");

			var nodes = JSON.parse(grapheJSON).nodes;
			var links = JSON.parse(grapheJSON).links;

			var db = {};
			db.nodes = new Datastore();
			db.links = new Datastore();

			//console.log(nodes);

			async.series([ 
				function(cb){
					db.nodes.insert(nodes, function (err, newDoc) {  
						db.links.insert(links, function (err, newDoc) {
					  		cb();
						}); 
					}); 
				},
				function(cb){

					parsersLib.processList(db,function(err,newNodes,newLinks){
						async.each(newNodes, function(currentNode,cbNode) {



							/*if(_.contains(["js","html"],currentNode.group)){
									var cluster = g.addCluster("cluster_"+currentNode.id);
									
									cluster.set( "style", "filled" );
									cluster.set( "color", "gray28" );
									cluster.set( "fillcolor", "gray90" );
									cluster.set( "label", "[inside "+currentNode.name+"]" );

									graphvizClass.clusters[currentNode.name] = cluster;

									graphvizClass.clusters[currentNode.name].addNode("n"+currentNode.id, currentNode.data);
							}
							else*/ if(currentNode.rootParentId !== null){


								
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


							


							//var cluster_0 = g.addCluster("cluster_0");


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
		    	g.use = "fdp";
				//g.set("sep","+25,25");
				g.set("splines",true);
				//g.set("nodesep",0.6);
				g.set("overlap","prism");
				





				if(type === "archvis"){
					

					fs.writeFile("app/data/classDiagram.dot", g.to_dot(), function(err) {
						proc1.exec('fdp -Tsvg app/data/classDiagram.dot -o '+path+'.svg', function (error, stdout, stderr) {
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

						console.log("Wavi could not generate a graph, make sure Graphviz is installed and path variable is set up correctly in your environnment variable");
						cbgenGraph(e,"");
					}		


				}
				else{

		    		try{
						g.output( type, path ,function(err){
							graphvizClass.errorHandler(err);
							console.log("Error in graphvizClass",err);
							cbgenGraph(err,"");
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