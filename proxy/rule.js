var $ = window.$;

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
                enable:true,
                type:'Combo',
                source:'/c/= /phone/ ,',
                dest:'/Users/woc2006/code/google'
            },
            {
                id:2,
                enable:true,
                type:'Host',
                source:'www.google.com',
                dest:'127.0.0.1'
            }
        ]
    },
    'Default2':{
        enable: false,
        rules: [
            {
                id:0,
                enable:false,
                type:'Replace',
                source:'www.google.com',
                dest:'/Users/woc2006/code/google'
            },
            {
                id:1,
                enable:false,
                type:'Combo',
                source:'/c/= /phone/ ,',
                dest:'/Users/woc2006/code/google'
            },
            {
                id:2,
                enable:true,
                type:'Host',
                source:'www.google.com',
                dest:'127.0.0.1'
            }
        ]
    },
    'Default3':{
        enable: true,
        rules: [
            {
                id:0,
                enable: false,
                type:'Replace',
                source:'www.google.com',
                dest:'/Users/woc2006/code/google'
            },
            {
                id:1,
                enable:true,
                type:'Combo',
                source:'/c/= /phone/ ,',
                dest:'/Users/woc2006/code/google'
            },
            {
                id:2,
                enable:false,
                type:'Host',
                source:'www.google.com',
                dest:'127.0.0.1'
            }
        ]
    }

};

exports.importRule = function(raw){
    var conf;
    try{
        conf = JSON.parse(raw);
    }catch(e){
        return;
    }
    groups = $.extend(groups,conf);
};

exports.exportRule = function(){
    return JSON.parse(groups);
};

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
    return true;
};

exports.updateRule = function(group, id, conf){
    if(!groups[group]) return;
    var _group = groups[group], len = _group.rules.length;
    if(id == null && conf != null){
        //add new rule
        if(len == 0){
            conf.id = 0;
        }else{
            conf.id = _group.rules[len-1].id + 1;
        }
        _group.rules.push(conf);
    }else{
        for(var i=0;i<len;i++){
            if(_group.rules[i].id == id){
                if(conf != null){
                    _group.rules[i] = $.extend(_group.rules[i],conf);
                }else{
                    _group.rules.splice(i,1);
                }
                break;
            }
        }
    }
};

exports.getGroups = function(){
    return groups;
};

exports.getRules = function(group){
    return groups[group];
}