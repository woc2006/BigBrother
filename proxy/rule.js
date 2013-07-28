var $ = window.$;
var LocalStorage = window.localStorage;

var groups = {
    'Default':{
        enable: true,
        rules: [
            {
                id:0,
                enable:true,
                type:'Replace',
                source:'www.google.com',
                dest:'/Users/woc2006/code/google'
            },
            {
                id:1,
                enable: false,
                type:'Combo',
                source:'http://gtimg.cn/c/=',
                prefix:'/phone/',
                separator:',',
                dest:'/Users/woc2006/code/phone'
            }
        ]
    }

};

var importRule = function(raw){
    var conf;
    try{
        conf = JSON.parse(raw);
    }catch(e){
        return;
    }
    groups = $.extend(groups,conf);
};

var saveRule = function(){
    var cache = JSON.stringify(groups);
    try{
        LocalStorage.setItem('config-rule',cache);
    }catch(e){}
};

exports.init = function(){
    var cache = LocalStorage.getItem('config-rule');
    importRule(cache);
}

/**
 *
 * @param group
 * @param newGroup
 * @param enable
 * @returns {boolean}
 */
exports.updateGroup = function(group, newGroup, enable){
    if(newGroup){
        if(groups[newGroup]) return false; //already exist
        if(group){
            //rename
            groups[newGroup] = groups[group];
            delete groups[group];
        }else{
            //new group
            groups[newGroup] = {
                enable : true,
                rules:[]
            };
        }
    }else{
        if(!groups[group]) return false;
        if(enable == null){
            //delete
            if(group == 'Default') return false;
            delete groups[group];
        }else{
            groups[group].enable = !!enable;
        }
    }
    setTimeout(function(){
        saveRule();
    },0);
    return true;
};

/**
 *
 * @param group
 * @param id
 * @param conf
 * @returns {Number} modified rule id, null for fail
 */
exports.updateRule = function(group, id, conf){
    if(!groups[group]) return null;
    var _group = groups[group], len = _group.rules.length;
    var _id;
    if(id == null && conf != null){
        //add new rule
        if(len == 0){
            conf.id = 0;
        }else{
            conf.id = _group.rules[len-1].id + 1;
        }
        _group.rules.push(conf);
        _id = conf.id;
    }else{
        for(var i=0;i<len;i++){
            if(_group.rules[i].id == id){
                if(conf != null){
                    _group.rules[i] = $.extend(_group.rules[i],conf);
                }else{
                    _group.rules.splice(i,1);
                }
                _id = id;
                break;
            }
        }
    }
    setTimeout(function(){
        saveRule();
    },0);
    return _id;
};

exports.getGroups = function(){
    return groups;
};

exports.getRules = function(group){
    return groups[group];
};

exports.getRule = function(group, id){
    if(!groups[group]) return null;
    var _group = groups[group], len = _group.rules.length;
    for(var i=0;i<len;i++){
        if(_group.rules[i].id == id){
            return _group.rules[i];
        }
    }
    return null;
}