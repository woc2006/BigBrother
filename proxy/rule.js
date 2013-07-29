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
                source:'http://qzonestyle.gtimg.cn/qzone/phone/m/v4/manifest.js',
                dest:'E:\\a.js'
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
    //build all reg
    for(var key in groups){
        var _group = groups[key];
        for(var i = 0, len = _group.rules.length; i<len; i++){
            var _rule = _group.rules[i];
            _rule.matchReg = buildMatchReg(_rule.source);
        }
    }
};

var saveRule = function(){
    var cache = JSON.stringify(groups);
    try{
        LocalStorage.setItem('config-rule',cache);
    }catch(e){}
};

var buildMatchReg = function(source){
    var str = source.replace(/([\:\+\.\?\$\\\/\|\*])/g,'\\$1')+'(.+)?';
    return new RegExp(str);
}

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
        conf.matchReg = buildMatchReg(conf.source);
        _group.rules.push(conf);
        _id = conf.id;
    }else{
        for(var i=0;i<len;i++){
            if(_group.rules[i].id == id){
                if(conf != null){
                    _group.rules[i] = $.extend(_group.rules[i],conf);
                    if(conf.source){
                        //reset match
                        _group.rules[i].matchReg = buildMatchReg(_group.rules[i].source);
                    }
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
};

exports.matchRule = function(url){
    for(var key in groups){
        var _group = groups[key];
        if(!_group.enable) continue;
        for(var i = 0, len = _group.rules.length; i<len; i++){
            var _rule = _group.rules[i];
            if(!_rule.enable) continue;

        }
    }
};