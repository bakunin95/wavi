global.define = function ( name, value, exportsObject )
{
    if ( !exportsObject )
    {
        if ( exports.exportsObject )
            exportsObject = exports.exportsObject;
        else 
            exportsObject = exports;        
    }

    Object.defineProperty( exportsObject, name, {
        'value': value,
        'enumerable': true,
        'writable': false,
    });
}

exports.exportObject = null;