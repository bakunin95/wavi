var      _ = require('underscore')._,
      path = require('path'),
        db = require('../deps/database');


        var async = require("async");

var parsersHelper = module.exports = {
  counter:{},
	getFirstDefinedArray: function(AST,list){
      var Defined = "";
      var candidate = null;
      _.each(list,function(filter){
            var currentFilter = filter.split(".");
            if(!_.isUndefined(AST[currentFilter[0]])){
              candidate = AST[currentFilter[0]];
            }
            else{
              return false;
            }
            var n = 1;
            if(currentFilter.length > 1){
              while (n !== currentFilter.length) {
                if(!_.isUndefined(candidate[currentFilter[n]])){
                  candidate = candidate[currentFilter[n]];
                }
                else{
                  break;
                }
                n++;
              }
            }
            if(n == currentFilter.length){
              Defined = candidate;
            } 
       });
      return Defined;
  },
  getCount: function(counterName){
      if(_.isUndefined(parsersHelper.counter[counterName])){
        parsersHelper.counter[counterName] = 1;
      }
      else{
        parsersHelper.counter[counterName]++;
      }
      return counterName+">"+parsersHelper.counter[counterName];
  },
  findFirstExistingAttr: function(elem,attrs){
    var name = "";
    _.each(attrs,function(attr){
        if(!_.isUndefined(elem.attr(attr))){
          name = elem.attr(attr);
          return;
        }
    });
    return name;
  },
  correctPathSync: function(filePath,parent){
      if(parent.folder === null || _.isUndefined(filePath) || _.isUndefined(parent.folder) || (filePath.substring(0, 7) == "mailto:") || (filePath.substring(0, 7) == "http://") || (filePath.substring(0, 8) == "https://")){
        return filePath;    
      } 
      else if(filePath === ".."){

          var mixedPath = path.normalize(parent.folder +"../index.js");
          mixedPath = mixedPath.replace(/\\/g,"\/" ).replace("//", "/"); 


          return mixedPath;
      }
      else if(filePath.slice(-3) === "/.."){

          filePath = filePath+"/index.js";
          var mixedPath = path.normalize(parent.folder +"/"+ filePath);
          mixedPath = mixedPath.replace(/\\/g,"\/" ).replace("//", "/"); 


          return mixedPath;

      }
      else{
        var mixedPath = path.normalize(parent.folder +"/"+ filePath);
        mixedPath = mixedPath.replace(/\\/g,"\/" ).replace("//", "/"); 
        return mixedPath; 
      }
  },
  correctParent: function(node,newParentName,cb){


    db.findOneNode({name:newParentName},function(err,newParent){


    //db.linkUpdate({},{source:newParent.id},cb)
    cb();

    })

  },
  correctPath: function(filePath,parent,cbCorrectPath){
          db.findLinksWhere({"target":parent.rootParentId},function(sources){
            var sourceList = _.pluck(sources,"source");
            db.findNodes({"id":{inq:sourceList},"group":"html"},function(nodes){
              if(!_.isUndefined(nodes) && nodes.length > 0){
                var folder = nodes[0].name;
                var folderTemp = folder.split("/");
                if(folderTemp.length>0){
                  folderTemp.pop();
                }
                folder = folderTemp.join("/");
                var mixedPath = path.normalize(folder +"/"+filePath);
                mixedPath = mixedPath.replace(/\\/g,"\/" ).replace("//", "/"); 
                cbCorrectPath(null,mixedPath);
              }
              else{
                cbCorrectPath(null,filePath);
              } 
            });

          });
    },
    addNode: function(node,parent,link,cbAddNode){
     // db.correctPath(node.name,parent,function(err,correctPath){
      var correctPath = node.name;
      //parsersHelper.correctPath(node.name,node,function(err,correctPath){
        if(node.group === "js" && correctPath.substr(correctPath.length - 3) !== ".js"){
            correctPath = correctPath+".js";
          }

       


          node.name = correctPath;

          db.addAssetAsync(node,parent,link,function(err,nodeAdded){   
                  
            cbAddNode(err,nodeAdded);   
          }); 
      //});   

     // }); 


        
    },
    updateAttribute: function(node,attribute,value,cb){
      db.updateAttribute(node,attribute,value,cb);
    },
    getLeftName: function(node){

      function getLeftNameB(name,node){

          
          if(node.type === "Identifier"){
            var name = node.name+"."+name;
          }
          else if(node.type === "ThisExpression"){
            var name = name;
          }
          else if(node.type === "BinaryExpression"){
             var name = "";
          }
          else if(_.isUndefined(node.property)){
              var name = node.name+"."+name;
          }
          else if(node.property.type === "Literal"){
            var name = "["+node.property.value+"]"+"."+name; 
          }
          else{
             

              var name = node.property.name+"."+name;   
          }


          if(node.object){
              return getLeftNameB(name,node.object);
          }




          return name.replace('undefined.', '');
      }                     


      if(node.object.type === "BinaryExpression" ){

        if (node.property.type === "Identifier"){
            return node.property.name;
        }
        else{
          return name;
        }
      }

      if(node.object){


        if(node.property.type !== "Identifier" || _.isUndefined(node.property.name)){
          return getLeftNameB("[]",node.object);
        }
        else{
          return getLeftNameB(node.property.name,node.object);
        }
      }


      return name;
    },
     getAlias: function(result,node){


      var result = {name:[],value:""};

      function getLeftNameB(result,node){
 
          if (node.left){

            if(node.left.type === "Identifier"){
              result.name.push(node.left.name);
            }
            

          }
          if(node.right){
            return getLeftNameB(result,node.right);
          }          
          else{
            result.value = node;
            return result;
          }

         

          
      }                     

      if(node.right){
          return getLeftNameB(result,node); 
      }

      return result;
    },
    getPrototypeVar: function(LeftName){
        var LeftNameArr = LeftName.split(".");

        var flag = 0;
        var key = [];
        var name = [];
        _.each(LeftNameArr,function(token){
            if(token === "prototype"){
                flag = 1;
            }
            else{
                if(flag === 0){
                    key.push(token);
                }
                else{
                    name.push(token);
                }
            }
        });
        return [key.join("."),name.join(".")];
    },
    getParams: function(params){
      var rawValue = [];
      _.each(params,function(param){
          if(param.type === "Identifier" && !_.isUndefined(param.name)){
              rawValue.push(param.name);
          }
      });
     
      if(rawValue.length>0){
          return rawValue.join(", ");
      }
      else{
          return "";
      }
    },
    reasignParent: function(node,parent,cbReasign){
      db.reasignParent(node,parent,cbReasign);
    },
    addPrototype: function(node,parent,protoVar,link,cbAddNode){
          db.addPrototype(node,parent,protoVar,link,function(err,nodeAdded){                   
            cbAddNode(err,nodeAdded);   
          });       
    },
    addExtend:function(node,parent,extendVar,link,cbAddNode){
          db.addExtend(node,parent,extendVar,{type:{label:"New"}},function(err,nodeAdded){                   
            cbAddNode(err,nodeAdded);   
          });       
    },
    getAjaxUrl: function(properties,node,cb){
      var url = null;
      async.each(properties,function(property,cbRel){
        if(!_.isUndefined(property.key) && !_.isUndefined(property.value) && property.key.type == "Identifier"){
          if(property.value.type === "Literal" || property.value.type === "Identifier"){
            if(property.key.name == "url"){
              url = property.value.value;
              var temp = node.rootParent.split("/");
              if(temp.length>0){
                temp = temp.slice(0,temp.length-2).join("/");
              }

             // console.log("proerty.value.value",property.value.value);


              url = parsersHelper.correctPathSync(property.value.value,{folder:temp});

              //console.log("url",url);
            }
          }
        }
        cbRel();
      },function(){
        cb(url);
      });
    },
    findNodes : function(filter,cbFind){
      db.findNodes(filter,cbFind);
    }
};

