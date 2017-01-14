 /*_.filter(classes, function (classe) {

        if (_.isUndefined(classe.type) && classe.properties.length === 0 && classe.methods.length === 0) {


            relations_new = _.filter(relations_new, function (relation) {
                //console.log(relation)
                //console.log(classe.key)

                if (relation.from === classe.key || relation.to === classe.key) {
                    //  console.log("@@@@TRUE")
                    return false;
                }
                else {
                    //    console.log("@@@@FALSE")
                    return true;
                }
            })


            return false;
        }
        else {
            return true;
        }
    });*/