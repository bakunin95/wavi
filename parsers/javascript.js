
var utils = require("../utils/utils");
var cheerio = require('cheerio');
var _ = require('underscore')._;
var db = require("../lib/database");
var estraverse = require('estraverse');
var esrecurse = require('esrecurse');
var escope = require('escope');
var assignmentExpression = require("./javascript/assignmentExpression");
var initStatement = require("./javascript/initStatement");
var umd = require('acorn-umd');
var acorn = require("acorn/dist/acorn_loose");
var parsersHelper = require("../utils/parsersHelper");
let instance = null;


var path = require('path');

class Javascript {
        constructor() {
                if (!instance) {
                        instance = this;
                }

                return instance;
        }



        operation(file) {
                return new Promise(
                        function (resolve, reject) {
                                Promise.resolve(file)
                                        .then(utils.read)
                                        .then(instance.parseAST)
                                        .then(instance.findJsElements)
                                        .catch(error => { console.log("err", error); })
                                        .then(function () {
                                                resolve();
                                        });

                        });
        }




        parseAST(result) {
                return new Promise(
                        function (resolve, reject) {

                                let path = result[0];
                                let data = result[1];
                                let ast = acorn.parse_dammit(data, { locations: true, sourceType: 'module', ecmaVersion: 6, ranges: false });

                                resolve([path, ast]);

                        });
        }



        getScope(result) {
                return new Promise(
                        function (resolve, reject) {
                                let ast = result[1];
                                try {
                                        let scopeManager = escope.analyze(ast, { sourceType: "module", ecmaVersion: 6 });

                                        result[1] = scopeManager.acquire(ast);
                                        resolve(result);
                                } catch (e) {
                                        reject("Bad Scope");
                                }
                        }
                );
        }





        findJsElements(result) {
                return new Promise(
                        function (resolve, reject) {
                                let path = result[0];
                                let ast = result[1];
                                let scopeManager = escope.analyze(ast, { sourceType: "module", ecmaVersion: 6 });
                                let allScopes = scopeManager.scopes;
                                //let classId = db.addClass({name:path});

                                let fileInfo = _.findWhere(db.getIdentifiedFiles(), { name: path });



                                let classId = fileInfo.id;
                                instance.checkImports(ast, fileInfo);


                                _.each(allScopes, function (curScope, key) {

                                        if ((curScope.upper === null || curScope.type === "module")) {
                                                // curScope.id = classId;
                                        }
                                        //   else if (curScope.childScopes.length === 0) {
                                        //curScope.type !== "function" && 
                                        //  }
                                        else if (curScope.upper.type === "function-expression-name" && curScope.type === "function") {

                                        }
                                        else {

                                                let scopeName = curScope.type;
                                                if (curScope.type === "block" && curScope.block && curScope.block.body && curScope.block.body.length > 0) {
                                                        scopeName = curScope.block.body[0].type;

                                                        if (curScope.block.body[0].type === "ExpressionStatement") {
                                                                scopeName = curScope.block.body[0].expression.type;
                                                        }

                                                }
                                                else if (curScope.block && curScope.block.id && curScope.block.id.name !== null) {
                                                        scopeName = curScope.block.id.name;
                                                }

                                                if (curScope.upper.upper.type === "function-expression-name") {
                                                        curScope.upper = curScope.upper.upper;
                                                }

                                                let fill = "lightblue";

                                                if (curScope.type !== "function") {
                                                        fill = "khaki";
                                                }

                                                curScope.id = db.addClass({ name: scopeName, fill: fill, type: curScope.type, file: path, cluster: fileInfo.cluster });

                                                if (!_.isUndefined(curScope.upper.id) && curScope.upper !== null && curScope.type !== "module") {

                                                        db.addRelations({ from: curScope.upper.id, to: curScope.id, relationship: "composition" });
                                                }

                                        }

                                });


                                let curClassId = classId;
                                estraverse.traverse(ast, {
                                        enter: function (node, parent) {

                                                if (/Function/.test(node.type)) {

                                                        let upper = scopeManager.acquire(node).upper.id;
                                                        curClassId = scopeManager.acquire(node).id;  // get current function scope

                                                        // console.log(node);

                                                        /* if (node.type === "FunctionDeclaration") {
                                                              let e = "";
                                                              var rawValue = [];
                                                              _.each(node.params, function (param) {
                                                                  if (param.type === "Identifier" && !_.isUndefined(param.name)) {
                                                                      rawValue.push(param.name);
                                                                  }
                                                              });
                                                              if (rawValue.length > 0) {
                                                                  params = rawValue.join();
                                                              }
                                                              db.addMethod(upper, { name: node.id.name + "(" + params + ")", type: "", visibility: "public" });
                                                          }*/

                                                        // console.log(scopeManager.acquire(node));

                                                        if (node.type === "FunctionDeclaration") {

                                                                let params = "";
                                                                var rawValue = [];
                                                                _.each(node.params, function (param) {
                                                                        if (param.type === "Identifier" && !_.isUndefined(param.name)) {
                                                                                rawValue.push(param.name);
                                                                        }
                                                                });
                                                                if (rawValue.length > 0) {
                                                                        params = rawValue.join();
                                                                }

                                                                if (scopeManager.acquire(node).childScopes === 0) {

                                                                        db.addMethod(upper, { name: node.id.name, value: params, type: "", visibility: "public" });
                                                                } else {
                                                                        params = parsersHelper.removeSpecialChar(params);
                                                                        db.setClass(curClassId, { name: node.id.name + "(" + params + ")" });
                                                                }


                                                        }
                                                        else if (node.type === "FunctionExpression") {


                                                                // console.log(node.id.name);
                                                                let name = "";
                                                                if (parent.type === "VariableDeclarator") {

                                                                        name = parent.id.name;
                                                                }
                                                                else if (node.id !== null) {
                                                                        name = node.id.name;
                                                                }
                                                                else if (parent.type === "AssignmentExpression") {
                                                                        name = parsersHelper.removeSpecialChar(parsersHelper.getLeftName(parent.left));
                                                                }


                                                                let params = "";
                                                                var rawValue = [];
                                                                _.each(node.params, function (param) {
                                                                        if (param.type === "Identifier" && !_.isUndefined(param.name)) {
                                                                                rawValue.push(param.name);
                                                                        }
                                                                });

                                                                if (rawValue.length > 0) {
                                                                        params = rawValue.join();
                                                                }

                                                                if (name === "" && parent.key && parent.key.name) {
                                                                        name = parent.key.name;
                                                                }


                                                                params = parsersHelper.removeSpecialChar(params);
                                                                db.setClass(curClassId, { name: name + "(" + params + ")" });

                                                        }


                                                }
                                                else if (node.type === "VariableDeclarator" && node.id && node.id.type === "Identifier") {
                                                        var parseResult = initStatement.parse(node);
                                                        if (parseResult.kind === "property") {
                                                                db.addProperty(curClassId, parseResult);
                                                        }
                                                        else {

                                                                db.addMethod(curClassId, parseResult);
                                                        }
                                                }
                                                else if (node.type === "AssignmentExpression") {
                                                        var parseResult = assignmentExpression.parse(node);
                                                        if (parseResult.kind === "property") {
                                                                db.addProperty(curClassId, parseResult);
                                                        }
                                                        else {

                                                                db.addMethod(curClassId, parseResult);
                                                        }
                                                }

                                                /*else if (node.type === "ClassDeclaration") {
                                                        db.addProperty(curClassId, parseResult);
                                                }*/

                                        },
                                        leave: function (node, parent) {

                                        }
                                });

                                resolve(ast);
                        }
                );
        }


        checkImports(ast, parent) {

                return new Promise(function (resolve, reject) {
                        var imports = umd(ast, { es6: true, amd: true, cjs: true });

                        _.each(imports, function (imp) {

                                if (imp.source && imp.source.length === undefined) {
                                        imp.source = [imp.source];
                                }
                                else {
                                        imp.source = imp.sources;
                                }

                                _.each(imp.source, function (source) {
                                        if (!_.isUndefined(source) && source.type === "Literal") {
                                                let correctedPath = utils.correctPathSync(source.value, parent.name, ".js");

                                                // Find correspondance
                                                let candidate = _.findWhere(db.getIdentifiedFiles(), { name: correctedPath });

                                                if (candidate !== undefined) {
                                                        // Create Relation
                                                        db.addRelations({ from: parent.id, to: candidate.id, relationship: "generalization", cluster: true });
                                                }

                                        }
                                });
                        });
                        resolve();
                        //reject();

                });
        }


}

module.exports = new Javascript();