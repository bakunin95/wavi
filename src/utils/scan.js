var async = require("async"),
	fs = require("fs"),
  _ = require('underscore')._,
  url = require("url"),
    path = require("path");

module.exports = function scan(dir, suffix, include_node_modules, callback) {
  fs.readdir(dir, function(err, files) {
    var returnFiles = [];
      if(_.isUndefined(files) == false){
        async.each(files, function(file, next) {
          var filePath = dir + '/' + file;
          fs.stat(filePath, function(err, stat) {
            if (err) {
              return next(err);
            }
            if (stat.isDirectory()) {
              if(include_node_modules == false && file == "node_modules"){
                next();
              }
              else{
                scan(filePath, suffix, include_node_modules, function(err, results) {
                  if (err) {
                    return next(err);
                  }
                  returnFiles = returnFiles.concat(results);
                  next();
                })
              }
            }
            else if (stat.isFile()) {
              if(typeof suffix !== 'string'){
                if(file.indexOf(".") > -1){
                  if(_.contains(suffix, file.split(".").pop().toLowerCase())){
                    if(filePath.substring(0, 2) == "./"){
                      filePath = filePath.substring(2);
                    }
                    returnFiles.push(filePath);
                  }
                }
              }
              else{
                if (file.indexOf(suffix, file.length - suffix.length) !== -1) {
                  if(filePath.substring(0, 2) == "./"){
                    filePath = filePath.substring(2);
                  }
                  returnFiles.push(filePath);
                }
              }
              next();
            }
            });
        }, function(err) {
          callback(err, returnFiles);
        });
      }
      else{
        callback(null, ""); 
      }
  });
};