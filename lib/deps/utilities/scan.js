var async = require("async"),
	fs = require("fs"),
  _ = require('underscore')._,
  url = require("url"),
    path = require("path");

module.exports = function scan(dir, suffix, callback) {
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
              scan(filePath, suffix, function(err, results) {
                if (err) {
                  return next(err);
                }
                returnFiles = returnFiles.concat(results);
                next();
              })
            }
            else if (stat.isFile()) {
              if(typeof suffix !== 'string'){
                if(file.indexOf(".") > -1){
                  if(_.contains(suffix, file.split(".").pop().toLowerCase())){
                    returnFiles.push(filePath);
                  }
                }
              }
              else{
                if (file.indexOf(suffix, file.length - suffix.length) !== -1) {
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