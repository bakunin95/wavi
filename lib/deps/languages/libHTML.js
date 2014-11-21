var fs = require("graceful-fs"),
    async = require("async"),
	cheerio = require('cheerio'),
    _ = require('underscore')._;
var libHTML = module.exports = {
		elementCount: 1,
		test: function(){

		},
	    getReport: function (file,cbHTML) {
	        cbHTML(null,"");
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
	    findAssets: function(node,data){
    		var assets = new Array();

    		node.composition = new Array();
	    	$ = cheerio.load(data);
	    	$('link[rel=stylesheet]').each(function(i, elem) {
	    		assets.push({"name":(_.isUndefined($(this).attr("href")) ? null: $(this).attr("href"))});	 
			});
			$('script').each(function(i, elem) {
	    		assets.push({"name":(_.isUndefined($(this).attr("src")) ? "[script "+ libHTML.elementCount++ +"]": $(this).attr("src"))});	 
			});
			$('a').each(function(i, elem) {
	    		assets.push({"name":(_.isUndefined($(this).attr("href")) ? null: $(this).attr("href"))});	 
			});
			/*
			$('form').each(function(i, elem) {
				node.composition.push("[form]");
	    		assets.push({"name":(_.isUndefined($(this).attr("action")) ? "[form "+ libHTML.elementCount++ +"]": $(this).attr("action"))});	 
			});

			$('input').each(function(i, elem) {
	    		assets.push({"name":(_.isUndefined($(this).attr("name")) ? "[input "+ libHTML.elementCount++ +"]": $(this).attr("name"))});	 
			});

			$('button').each(function(i, elem) {
	    		assets.push({"name":(_.isUndefined($(this).attr("name")) ? "[button "+ libHTML.elementCount++ +"]": $(this).attr("name"))});	 
			});
			*/
			if(assets.length > 0){
	    		return [node,assets]; 
	    	}
	    	else{
	    		return null;
	    	} 
	    },
	    processAssets: function(){

	    },
	    errorHandler: function(err){
			if(err){
				console.log("***************************************************************");
				console.log("*libHTML*************************************************");
				console.log(err);
				console.log("***************************************************************");
			}
		}

};