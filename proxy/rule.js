var $ = window.$;
var LocalStorage = window.localStorage;
var path = require('path');

var groups = {
    'Default':{
        enable: true,
        rules: []
    }
};

var hostReg = /^\d+\.\d+\.\d+\.\d+$/;

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

/**
 * See tests/rule.html for example
 * @param source
 * @returns {RegExp}
 */
var buildMatchReg = function(source){
    var str = source.replace(/([\:\+\.\?\$\\\/\|\*])/g,'\\$1')+'([^\\?#]+)?([\\?#].*)?';
    return new RegExp(str);
};

var processConf = function(conf){
    conf.source = conf.source.trim();
    conf.dest = conf.dest.trim();
    conf.matchReg = buildMatchReg(conf.source);
    if(hostReg.exec(conf.dest)){
        conf.type = 'Host';
    }
    return conf;
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
 * @returns {Object}
 */
exports.updateRule = function(group, id, conf){
    if(!groups[group]) return null;
    var _group = groups[group], len = _group.rules.length;
    var _rule = null;
    if(id == null && conf != null){
        //add new rule
        conf.id = 0;
        for(var i=0;i<len;i++){
            if(_group.rules[i].id > conf.id){
                conf.id = _group.rules[i].id;
            }
        }
        conf.id++;
        conf.enable = true; //turn on by default
        conf = processConf(conf);
        _group.rules.push(conf);
        _rule = conf;
    }else{
        for(var i=0;i<len;i++){
            if(_group.rules[i].id == id){
                if(conf != null){
                    _group.rules[i] = processConf($.extend(_group.rules[i],conf));

                    _rule = _group.rules[i];
                }else{
                    _group.rules.splice(i,1);
                }
                break;
            }
        }
    }
    setTimeout(function(){
        saveRule();
    },0);
    return _rule;
};

/**
 *
 * @param group
 * @param id  move this rule
 * @param refId  based on this rule
 * @param delta
 * @return {Boolean} move success or fail
 */
exports.changeRuleOrder = function(group, id, refId, delta){
    if(!groups[group]) return false;
    var rules = groups[group].rules, len = rules.length;
    var pos = -1, refPos = -1;
    for(var i=0;i<len;i++){
        var rule = rules[i];
        if(rule.id == id){
            pos = i;
        }
        if(rule.id == refId){
            refPos = i;
        }
    }
    if(pos == -1) return false;
    if(refPos == -1){
        refPos = pos;
    }
    refPos = refPos + delta;
    if(refPos < 0 || refPos >= len) return false;
    var del = rules.splice(pos,1);
    rules.splice(refPos, 0, del[0]);
    return true;
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

//TODO: need cache for fast reference
exports.matchRule = function(url){
    for(var key in groups){
        var _group = groups[key];
        if(!_group.enable) continue;
        for(var i = 0, len = _group.rules.length; i<len; i++){
            var _rule = _group.rules[i];
            if(!_rule.enable) continue;
            if(!_rule.matchReg) continue;
            var match = _rule.matchReg.exec(url);
            if(!match) continue;
            var resultArr = [];
            if(!match[1] || match[1] == '/' || match[1] == '\\'){
                resultArr.push(_rule.dest);
            }else if(_rule.type == 'Host'){
                resultArr.push(_rule.dest);
            }else if(_rule.type == 'Replace'){
                resultArr.push((_rule.dest + match[1]).replace(/\//g,path.sep));
            }else{
                var arr = match[1].split(_rule.separator);
                for(var i= 0,len = arr.length;i<len;i++){
                    resultArr.push((_rule.dest + arr[i].replace(_rule.prefix,'')).replace(/\//g, path.sep));
                }
            }
            return {
                files: resultArr,
                meta: _rule
            };
        }
    }
    return null;
};