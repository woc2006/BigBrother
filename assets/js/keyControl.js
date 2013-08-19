var $ = window.$;
var callbacks = {};
var cid = 0;
exports.on = function(callback){
    callbacks[cid++] = callback;
};

exports.off = function(cid){
    delete callbacks[cid];
};

exports.init = function(){
    $(window.document.body).on('keyup',function(e){
        for(var key in callbacks){
            if(callbacks[key].call(this,e) === true) break;
        }
    });
};