require("babel-polyfill");
var Viz = require('./viz.js');
var utils = require('../utils/utils');
var _ = require('underscore')._;


var fs = require("fs");



module.exports = {

        createDot: function (options, classes, relations) {

                let graph_settings = "";
                if (options.EXPERIMENTAL === true) {
                        graph_settings = "layout=fdp";
                }
                else {
                        //
                        graph_settings = "compound=true;\n splines=true;\n labeljust=left; rankdir=TB;\n  overlap=false; \n ranksep=0.1;  nodesep=0.1";
                }

                var USE_RANKING = false;
                let dotResult = [];

                //
                let txt = "digraph G {\n "+graph_settings+"  \n ";
                let cluster = 0;
                let current_cluster = "";

                var sortedClasses = _.sortBy(classes, 'cluster');

                _.each(sortedClasses, function (classe) {

                        if (current_cluster !== classe.cluster) {
                                if (current_cluster !== "") {
                                        txt += "\n } \n";
                                }
                                current_cluster = classe.cluster;
                                txt += 'subgraph ' + classe.cluster + ' {\n  style="filled"; color=black;fillcolor=lightgray;fontsize=30;  label = "' + classe.name + '"; \n color=lightgrey; \n node[shape=record,style=filled,fillcolor=gray95] \n';

                                //shape="folder";

                                cluster++;
                        }

                        let methods = [];


                        _.each(classe.methods, function (method) {
                                methods.push(method + "\\l");
                        });

                        methods = _.unique(methods).sort();

                        let properties = [];
                        _.each(classe.properties, function (property) {
                                properties.push(property + "\\l");
                        });

                        properties = _.unique(properties).sort();


                        if (classe.type === "css") {

                        }


                        else if (classe.is_global === true) {
                                classe.type = "Global";
                                classe.name = "";
                        }



                        let title = "";
                        if (!_.isUndefined(classe.type)) {
                                title = " \«" + classe.type.toUpperCase() + "»\\n "
                        }
                        title += classe.name;


                        let propsep = "";
                        if (properties.length > 0) {
                                propsep = '|';
                        }

                        let methodsep = "";
                        if (methods.length > 0) {
                                methodsep = '|';
                        }


                        txt += classe.key + '[label = "{' + title + propsep + properties.join("") + methodsep + methods.join("") + '}", fillcolor=' + classe.fill + ']\n ';
                });

                //*************************************** */

                if (USE_RANKING) {
                        let rank = []


                        let total_clusters = cluster;
                        //
                        let count = 0;
                        let rk = "";
                        for (index = 0; index < total_clusters; ++index) {
                                count++;
                                rk += index + " ";
                                if (count === 3) {
                                        count = 0;
                                        rank.push("{rank=same " + rk + "}");
                                        rk = "";
                                }


                        }
                        if (rk != "") {
                                rank.push("{rank=same " + rk + "}");
                        }

                        let ranking = rank.join(" -> ") + "[style=invis]";


                        txt += ranking;
                }

                //************************************************************* */
                txt += "\n}\n"
                _.each(relations, function (relation) {


                        let arrowstyle = "";

                        if (relation.relationship === "composition") {
                                arrowstyle = "arrowtail=diamond dir=back";
                        }

                        if (relation.cluster === true) {
                                txt += relation.from + "->" + relation.to + " [ " + arrowstyle + "ltail=cluster_" + relation.from + "," + "lhead=cluster_" + relation.to + "] \n";
                        }
                        else {
                                txt += relation.from + "->" + relation.to + " [" + arrowstyle + "]   \n";
                        }

                });
                txt += "}";

                //utils.append('test.dot', txt);

                return txt;

        },
        generateGraph: function (dotResult) {

                try {
                        return Viz(dotResult, "svg");

                } catch (e) {
                        console.log(e)
                        return;
                }

        }

}