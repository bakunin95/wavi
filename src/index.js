"use strict";
require("babel-polyfill");
//NodeJS dependencies
var co = require('co');
var path = require('path');
var async = require("async");
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;
var fs = require("fs");
var _ = require('underscore')._;

//Wavi local dependencies
var utils = require("./utils/utils");
var css_parser = require("./parsers/css");
var html_parser = require("./parsers/html");
var javascript_parser = require("./parsers/javascript");
var graph = require("./lib/graph");
var db = require("./lib/database");



let instance = null;

class Wavi {
    constructor() {
        if (!instance) {
            instance = this;
        }

        return instance;
    }


    analyze(options, website_folder, website_target) {

        website_folder = path.resolve(website_folder).replace(/\\/g, '\/');
        website_target = path.resolve(website_target).replace(/\\/g, '\/');


        console.log("Processing website: " + website_folder);

        var identifiedFiles;

        var WRITE_RESULTS_TO_JSON = false;

        var WRITE_RESULTS_TO_DOT = false;

        co(function* () {

            utils.startTimer();

            let all_files = yield utils.scanFiles(website_folder, ['js', 'html', 'css']);

            identifiedFiles = yield instance.indentifyFiles(all_files);

            db.setIdentifiedFiles(identifiedFiles);

            let js_files = _.pluck(_.where(db.getClasses(), { type: 'js' }), "name");

            let html_files = _.where(db.getClasses(), { type: 'html' });

            let css_files = _.where(db.getClasses(), { type: 'css' });

            yield [css_files.map(css_parser.operation_css), html_files.map(html_parser.operation_html), js_files.map(javascript_parser.operation)];
            let dotResult = graph.createDot(options, db.getClasses(), db.getRelations());

            if (WRITE_RESULTS_TO_JSON === true) {
                yield [utils.writefile("data.json")(JSON.stringify(db.getClasses(), 0, 4)),
                utils.writefile("relations.json")(JSON.stringify(db.getRelations(), 0, 4))];
            }

            if (WRITE_RESULTS_TO_DOT === true) {
                try {
                    fs.unlinkSync("test.dot");
                } catch (e) { }

            }
            console.log("finished analyzing, now generating graph")

            let resultSvg = graph.generateGraph(dotResult);

            yield utils.writefile(website_target)(resultSvg);

            console.log("Graph generated: " + website_target);

            utils.stopTimer();
        }).catch(instance.onerror);

    }
    onerror(err) {
        console.error(err.stack);
    }

    indentifyFiles(fileList) {
        var newList = [];
        return new Promise((resolve, reject) => {
            var ids = 0;
            _.each(fileList, (item) => {



                //item = utils.correctPathSync(item);

                //item = path.normalize(item);

                let color = "lightyellow";
                let type = "js";
                if (item.slice(-5) === ".html") {
                    color = "lightsalmon";
                    type = "html";
                }
                if (item.slice(-4) === ".css") {
                    color = "lightgreen";
                    type = "css";
                }
                let id = db.addClass({ name: item, fill: color, type, cluster: "cluster_" + ids, is_global: true });
                newList.push({ name: item, id, cluster: "cluster_" + ids })
                ids += 1;
            });
            resolve(newList);
        });
    }



}

/*



*/

module.exports = new Wavi();


