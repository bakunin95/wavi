var fs = require("fs");
var async = require("async");
var _ = require("lodash");
_.mixin(require("lodash-deep"));
var requireDir = require('require-dir');
var parsersList = requireDir("../../parsers/misc/");

var miscClass = module.exports = {
    analyze: function(files, cbmiscClass) {
        miscClass.parsersNormal = _.sortBy(_.where(_.flatten(_.map(parsersList, function(n) {
            return n;
        })), {
            "active": true
        }, 'priority'));
        async.eachLimit(files, 5, function(parent, cbFiles) {
            async.eachSeries(miscClass.parsersNormal, function(parser, cbNormParse) {
                if (_.includes(parser.group, parent.group)) {
                    if (parent.exist === true) {
                        fs.readFile(parent.name, "utf-8", function read(err, data) {
                            parser.parse(parent, data, cbNormParse);
                        });
                    } else {
                        parser.parse(parent, null, cbNormParse);
                    }
                } else {
                    setImmediate(function() {
                        cbNormParse()
                    });
                }
            }, function(err2) {
                setImmediate(function() {
                    cbFiles()
                });
            });
        }, function() {
            setImmediate(function() {
                cbmiscClass()
            });
        });

    }
}