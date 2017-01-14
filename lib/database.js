var _ = require('underscore')._;
var parsersHelper = require("../utils/parsersHelper");

var db = module.exports = {
        classes: [],
        relations: [],
        count: 0,
        addProperty: function (classId, property) {
                property.name = parsersHelper.removeSpecialChar(property.name);
                property.name = parsersHelper.reduceLength(property.name, 30)
                if (classId !== undefined && property.name !== undefined && property.name !== "") {
                        property.value = parsersHelper.removeSpecialChar(parsersHelper.reduceLength(property.value, 30));
                        let prop = property.visibility + property.name;
                        if (property.type !== null && property.type !== "" && property.type !== "undefined") {
                                prop += " : " + property.type;
                        }
                        if (property.value !== null && property.value !== "" && property.value !== undefined && property.value !== "null") {
                                prop += " = " + property.value;
                        }
                        db.classes[classId].properties.push(prop);
                }
        },
        addMethod: function (classId, method) {
                if (classId !== undefined) {
                        method.name = parsersHelper.removeSpecialChar(parsersHelper.reduceLength(method.name, 30));
                        method.value = parsersHelper.removeSpecialChar(parsersHelper.reduceLength(method.value, 30));
                        db.classes[classId].methods.push(method.visibility + method.name + "(" + method.value + ")");
                }
        },
        addClass: function (myClass) {
                myClass.key = db.count;
                if (myClass.fill === null || myClass.fill === undefined) {
                        myClass.fill = "lightyellow";
                }
                myClass.properties = [];
                myClass.methods = [];
                db.count++;
                db.classes.push(myClass);
                return db.count - 1;
        },
        setClass: function (key, newClass) {
                db.classes[key] = _.extend(db.classes[key], newClass);
        },
        addRelations: function (rel) {
                db.relations.push(rel);
        },
        getClass: function (classId) {
                return db.classes[classId];
        },
        getClasses: function () {
                return db.classes;
        },
        getRelations() {
                return db.relations;
        },

        setIdentifiedFiles: function (identifiedFiles) {
                db.identifiedFiles = identifiedFiles;
        },
        getIdentifiedFiles: function () {
                return db.identifiedFiles;
        }
}