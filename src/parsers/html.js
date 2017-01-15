
var utils = require("../utils/utils");
var cheerio = require('cheerio');
var _ = require('underscore')._;
var db = require("../lib/database");

let instance = null;

class Html {
        constructor() {
                if (!instance) {
                        instance = this;
                }

                return instance;
        }


        find_html_elements(result) {
                return new Promise(
                        function (resolve, reject) {
                                let parent = result[0];
                                let $ = result[1];


                                _.each($.root(), function (elem) {
                                        instance.recursive_element($, elem, null, parent);
                                });

                                resolve();

                        });
        }
        recursive_element($, elem, parent, parent_file) {

                let tag = $(elem).get(0).tagName;
                let value;
                let name = "";
                let type = tag;
                let current = parent_file.key;
                if (parent !== null) {
                        current = parent.key;
                }

                if (tag === "script") {
                        if ($(elem).attr("src") !== undefined) {
                                let correctedPath = utils.correctPathSync($(elem).attr("src"), parent_file.name, ".js");
                                let candidate = _.findWhere(db.getIdentifiedFiles(), { name: correctedPath });
                                if (candidate !== undefined) {
                                        db.addRelations({ from: parent_file.key, to: candidate.id, relationship: "", cluster: true });
                                }
                        }
                }


                if (tag === "link") {
                        if ($(elem).attr("href") !== undefined) {
                                let correctedPath = utils.correctPathSync($(elem).attr("href"), parent_file.name);

                                let candidate = _.findWhere(db.getIdentifiedFiles(), { name: correctedPath });
                                if (candidate !== undefined) {
                                        db.addRelations({ from: parent_file.key, to: candidate.id, relationship: "", cluster: true });
                                }
                        }
                }

                if ($(elem).children().length === 0) {
                        name = tag;

                        if ($(elem).attr("id") !== undefined) {
                                name = $(elem).attr("id");
                        }

                        if (_.contains(['link', 'a', 'ddd'], tag)) {
                                value = $(elem).attr("href")
                        }

                        if (tag === "script") {
                                value = $(elem).attr("src")
                        }

                        if (tag === "a") {
                                name = "link"
                        }

                        db.addProperty(current, { name: name, value: value, type: type, visibility: "+" });
                }
                else {
                        let classId = db.addClass({ name: name, fill: "pink", type: type, file: parent_file.name, cluster: parent_file.cluster });
                        db.addRelations({ from: current, to: classId, relationship: "composition" });
                        current = classId;
                        parent = db.getClass(classId);
                }

                if ($(elem).children().length > 0) {
                        _.each($(elem).children(), function (child) {
                                instance.recursive_element($, child, parent, parent_file);
                        });

                }

        }
        operation_html(file) {
                return new Promise(
                        function (resolve, reject) {
                                Promise.resolve(file)
                                        .then(utils.read_node)
                                        .then(instance.parse_dom)
                                        .then(instance.find_html_elements)
                                        .catch(error => { console.log("err", error); })
                                        .then(function () {
                                                resolve();
                                        });

                        });
        }
        parse_dom(result) {
                return new Promise(
                        function (resolve, reject) {
                                let node = result[0];
                                let data = result[1];
                                let $ = cheerio.load(data);
                                resolve([node, $]);

                        });
        }

}

module.exports = new Html();