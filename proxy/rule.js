var $ = window.$;
var LocalStorage = window.localStorage;
var path = require('path');

var groups = {
    'Default':{
        enable: true,
        rules: []
    }
};

//sync all these values in tmpl/ruleEdit.ejs
var additionRule = {
    none: 0,
    requestPause: 1,
    responsePause: 2,
    crossDomain: 4,
    continues: 8
};

var regHost = /^\d+\.\d+\.\d+\.\d+(\:\d+)?$/;
var regReg = /^\/(.*)\/([gmi]{0,3}$)/;
var regSplit = /\(\?\:[^\)]+\)/g;
var regReplace = /([\:\+\.\?\$\\\/\|\*])/g;

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
    var match = regReg.exec(source);
    if(match){
        return new RegExp(match[1],match[2]);
    }else{
        var arr = source.split(regSplit);
        if(!arr || !arr.length){
            arr = [source];
            arr[0] = arr[0].replace(regReplace,'\\$1');
        }else{
            for(var i=0;i<arr.length;i++){
                arr[i] = arr[i].replace(regReplace,'\\$1');
            }
            var index = 1;
            while(t = regSplit.exec(source)){
                arr.splice(index,0,t[0]);
                index += 2;
            }
        }

        return new RegExp(arr.join('')+'([^\\?#]+)?([\\?#].*)?');
    }
};

var processConf = function(conf){
    conf.source = conf.source.trim();
    conf.dest = conf.dest.trim();
    conf.matchReg = buildMatchReg(conf.source);
    if(regHost.exec(conf.dest)){
        conf.type = 'Host';
    }else if(conf.dest == ''){
        conf.type = 'Addition';
    }else if(conf.prefix != '' || conf.separator !=''){
        conf.type = 'Combo';
    }else{
        conf.type = 'Replace';
    }
    return conf;
};

exports.init = function(){
    var cache = LocalStorage.getItem('config-rule');
    importRule(cache);
};

exports.additionRule = additionRule;

/**
 *
 * @param group
 * @param newGroup
 * @param enable
 * @returns {boolean}
 */
exports.updateGroup = function(group, newGroup, enable){
    var _group = null;
    if(newGroup){
        if(groups[newGroup]) return null; //already exist
        if(group){
            //rename
            groups[newGroup] = groups[group];
            delete groups[group];
            _group = groups[newGroup];
        }else{
            //new group
            _group = {
                enable : true,
                rules:[]
            }
            groups[newGroup] = _group;
        }
    }else{
        if(!groups[group]) return null;
        if(enable == null){
            //delete
            if(group == 'Default') return null;
            delete groups[group];
        }else{
            groups[group].enable = !!enable;
            _group = groups[group];
        }
    }
    setTimeout(function(){
        saveRule();
    },0);
    return _group;
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
    setTimeout(function(){
        saveRule();
    },0);
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
    var matchedRule = null;
    for(var key in groups){
        var _group = groups[key];
        if(!_group.enable) continue;
        for(var i = 0, len = _group.rules.length; i<len; i++){
            var _rule = _group.rules[i];
            if(!_rule.enable) continue;
            if(!_rule.matchReg) continue;
            var match = _rule.matchReg.exec(url);
            if(!match) continue;
            var add = matchedRule ? matchedRule.additional : 0;
            matchedRule = $.extend({},matchedRule,_rule);
            matchedRule.additional = add | _rule.additional; //reset to proper value

            if((_rule.additional & additionRule.continues)>0){
                continue;
            }else{
                return buildMatchedResult(matchedRule, url);
            }
        }
    }
    if(matchedRule){
        return buildMatchedResult(matchedRule, url);
    }else{
        return null;
    }
};

var buildMatchedResult = function(rule, url){
    var match = rule.matchReg.exec(url); //always matched
    var resultArr = [];
    if(!match[1] || match[1] == '/' || match[1] == '\\'){
        resultArr.push(rule.dest);
    }else if(rule.type == 'Addition'){
        resultArr.push('');
    }else if(rule.type == 'Host'){
        var arr = rule.dest.split(':');
        resultArr.push(arr[0]);
        resultArr.push(arr[1]);
    }else if(rule.type == 'Replace'){
        resultArr.push((rule.dest + match[1]).replace(/\//g,path.sep));
    }else{
        var arr = match[1].split(rule.separator);
        for(var i= 0,len = arr.length;i<len;i++){
            resultArr.push((rule.dest + arr[i].replace(rule.prefix,'')).replace(/\//g, path.sep));
        }
    }
    return {
        files: resultArr,
        meta: rule
    };
}
