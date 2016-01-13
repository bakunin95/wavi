var cheerio = require("cheerio");
var async = require("async");
var fs = require("fs");
var _ = require("lodash");
var db = require("../database.js");
var requireDir = require('require-dir');
var parsersList = requireDir("../../parsers/dom/");
var parsersHelper = require("../../parsers/parsersHelper");


var domClass = module.exports = {
	countType: [],
	parsers:[],
	analyze: function(files,cbDomClass){
		domClass.parsers = _.where(_.flatten(_.map(parsersList, function(n) { return n; })),{"active": true});
		domClass.tags = _.flatten(_.pluck(domClass.parsers,"tag"));
		async.eachSeries(files,function(parent,cbFiles){
			if(parent.group === "html-markup"){
				var $ = cheerio.load(parent.data);	
				async.each($.root(),function(elem,cbHTML){
					domClass.recursiveElement($,elem,parent,parent,cbHTML);
				},function(err){
					cbFiles();
				});
			}
			else{
				fs.readFile(parent.name,"utf-8", function read(err, data) {
					var $ = cheerio.load(data);	
					async.each($.root(),function(elem,cbHTML){
						domClass.recursiveElement($,elem,parent,parent,cbHTML);
					},function(err){
						cbFiles();
					});
				});
			}		
		},function(){
			cbDomClass();
		});

	},
	generateNode: function(elem,parser,parent,rootParent){

		var node = {};
		node.rootParent = rootParent.name;
		node.rootParentId = rootParent.id;
		node.rootParentType = rootParent.type;
		node.hierarchyFile = rootParent.hierarchyFile;

		if(typeof parser.name === "function"){
			node.name = parser.name(elem,parent);
		}
		else if(typeof parser.name === "object") {
			node.name = domClass.findFirstExistingAttr(elem,parser.name);
		}

		if(node.name == "" && parser.altname){
			node.name = parsersHelper.getCount(parser.altname);

		}

		if(typeof parser.rawName === "function"){
			node.rawName = parser.rawName(elem,parent);
		}
		else if(typeof parser.rawName === "object") {
			node.rawName = domClass.findFirstExistingAttr(elem,parser.rawName);
		}

		if(typeof parser.rawValue === "function"){
			node.rawValue = parser.rawValue(elem,parent);
		}
		else if(typeof parser.rawValue === "object") {
			node.rawValue = domClass.findFirstExistingAttr(elem,parser.rawValue);
		}

		if(typeof parser.rawType === "function"){
			node.rawType = parser.rawType(elem,parent);
		}
		else if(typeof parser.rawType === "object") {
			node.rawType = domClass.findFirstExistingAttr(elem,parser.rawType);
		}

		if(typeof parser.group === "function"){
			node.group = parser.group(elem,parent);
		}
		else if(typeof parser.group === "string") {
			node.group = parser.group;
		}

		if(typeof parser.parse === "function"){
			_.assign(node, parser.parse(elem,parent));
		}

		if(!_.isUndefined(node.name)){
			node.hierarchyElement =  node.name.split("::").length;
		}

		return node;
	},
	recursiveElement: function($,elem,parent,rootParent,cbRE){
		var tag = $(elem).get(0).tagName;
		if(_.contains(domClass.tags,tag)){
			var parser = _.find(domClass.parsers, function(parser){
				return _.contains(parser.tag,tag)
			});	

			if(_.isUndefined(domClass.countType[parser.analysis])){
	    		domClass.countType[parser.analysis] = 1;
	    	}
	    	else{
	    		domClass.countType[parser.analysis]++;
	    	}

			var node = domClass.generateNode($(elem),parser,parent,rootParent);

			var link = {};
			link.group = 1;

			if(!_.isUndefined(parser.link)){
				link.type = parser.link;
			}

			link.group = 1;
			link.type = {"dir":"back","arrowtail":"diamond"};
			
			db.addAssetAsync(node,parent,link,function(err,newParent){
				if($(elem).children().length>0){
					async.each($(elem).children(),function(elem,cbRE2){
						domClass.recursiveElement($,elem,newParent,rootParent,cbRE2);
					},function(){
						cbRE();
					});
				}
				else{
					cbRE();
				}
			});
		}
		else{
			if($(elem).children().length>0){
				async.each($(elem).children(),function(elem,cbRE2){
					domClass.recursiveElement($,elem,parent,rootParent,cbRE2);
				},function(){
					cbRE();
				});
			}
			else{
				cbRE();
			}
		}
	},
	findFirstExistingAttr: function(elem,attrs){
		var name = "";
		_.each(attrs,function(attr){
				if(!_.isUndefined(elem.attr(attr))){
					name = elem.attr(attr);
					return;
				}
		});
		return name;
	}
}