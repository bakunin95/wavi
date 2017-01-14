var cssparse = require("css").parse;
var utils = require("../utils/utils");
var db = require("../lib/database");
var async = require("async");
var _ = require('underscore')._;
var path = require('path');


let instance = null;

class Css {
        constructor() {
                if (!instance) {
                        instance = this;
                }

                return instance;
        }


        operation_css(file) {
                return new Promise(
                        function (resolve, reject) {
                                Promise.resolve(file)
                                        .then(utils.read_node)
                                        .then(instance.parse_css)
                                        .then(instance.find_css_elements)
                                        .catch(error => { console.log(error); })
                                        .then(function () {
                                                resolve();
                                        });

                        });
        }
        parse_css(result) {
                return new Promise(
                        function (resolve, reject) {
                                try {
                                        let path = result[0];
                                        let data = result[1];
                                        let ast = cssparse(data);
                                        resolve([path, ast]);
                                } catch (e) {

                                       
                                        reject("File contain syntax error: " + result[0].name);
                                }
                        });
        }
        find_css_elements(result) {
                return new Promise(
                        function (resolve, reject) {
                                let parent = result[0];
                                let ast = result[1];

                                async.each(ast.stylesheet.rules, function (rule, cbVar) {
                                        if (rule.selectors !== null && _.isUndefined(rule.selectors) == false) {
                                                let name = utils.escapeHTML(rule.selectors.join(" "));
                                                let value = rule.declarations.length + " props";


                                                let classId = db.addClass({ name: name, fill: "palegreen", file: parent.name, cluster: parent.cluster });
                                                db.addRelations({ from: parent.key, to: classId, relationship: "composition" });


                                                _.each(rule.declarations, function (declaration) {
                                                        let prop = db.addProperty(classId, { name: declaration.property, value: declaration.value, type: "", visibility: "+" });
                                                })


                                                cbVar();

                                                /*async.each(rule.declarations, function (declaration, cbRule) {
                                                    let prop = db.addProperty(classId, { name: declaration.property, value: declaration.value, type: "", visibility: "+" });
                                                    cbRule();
                                                }, function (err) {
                                                    cbVar();
                                                })*/

                                        } else {
                                                cbVar()
                                        }
                                }, function (err) {
                                        resolve();
                                })

                        });
        }


}

module.exports = new Css();
