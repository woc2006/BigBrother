var $ = window.$;
var LocalStorage = window.localStorage;

var filterItems = {
    '200' : {
        type:'Request 200',
        hide: false,
        highlight: false
    },
    '304':{
        type:'Request 304',
        hide: false,
        highlight: false
    },
    '404':{
        type:'Request 404',
        hide: false,
        highlight: false
    },
    '500':{
        type:'Request 500',
        hide: false,
        highlight: false
    },
    'html':{
        type:'Resource html',
        hide: false,
        highlight: false
    },
    'css':{
        type:'Resource css',
        hide: false,
        highlight: false
    },
    'js':{
        type:'Resource javascript',
        hide: false,
        highlight: false
    },
    'image':{
        type:'Resource image',
        hide: false,
        highlight: false
    }
};

var ruleStyle = {
    bold: false,
    italic: false,
    color: '#000'
};
var regType = /\/(.+)/;
var regResource = /\.(\w+)(\?|$)/;
var getResourceType = function(path, type){
    //target: /xxxx.(jpg)?v=12345
    var target = '';
    if(type){
        var raw = regType.exec(type);
        type = raw[1];
    }else{
        var raw = regResource.exec(path);
        type = (raw && raw[1]) || '';
    }
    switch(type){
        case 'htm':
        case 'xhtml+xml':
            return 'html';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'pjpeg':
        case 'x-png':
            return 'image';
        default:
            return type;
    }
}


var importFilter = function(raw){
    var conf;
    try{
        conf = JSON.parse(raw);
    }catch(e){
        return;
    }
    filterItems = $.extend(filterItems,conf);
};

var importStyle = function(raw){
    var conf;
    try{
        conf = JSON.parse(raw);
    }catch(e){
        return;
    }
    ruleStyle = $.extend(ruleStyle,conf);
};

var saveFilter = function(){
    var cache = JSON.stringify(filterItems);
    try{
        LocalStorage.setItem('config-filter',cache);
    }catch(e){}
};

var saveStyle = function(){
    var cache = JSON.stringify(ruleStyle);
    try{
        LocalStorage.setItem('config-style',cache);
    }catch(e){}
};

exports.init = function(){
    var cache = LocalStorage.getItem('config-filter');
    importFilter(cache);
    cache = LocalStorage.getItem('config-style');
    importStyle(cache);
};

exports.updateConfig = function(id,type,val){
    if(!filterItems[id] || typeof filterItems[id][type] == 'undefined') return;
    filterItems[id][type] = !!val;
    saveFilter();
};

exports.updateRuleStyle = function(type, val){
    if(typeof ruleStyle[type] == 'undefined') return;
    if(type != 'color'){
        ruleStyle[type] = !!val;
    }else{
        ruleStyle[type] = val;
    }
    saveStyle();
}

exports.getFilterItems = function(){
    return filterItems;
};

exports.getRuleStyle = function(){
    return ruleStyle;
};

exports.applyFilter = function(conf){
    conf.hide = false;
    conf.highlight = false;
    if(filterItems[conf.status]){
        conf.hide = filterItems[conf.status].hide;
        conf.highlight = filterItems[conf.status].highlight;
    }
    var type = getResourceType(conf.path, (conf.responseHeader?(conf.responseHeader['Content-Type'] || conf.responseHeader['content-type']):null));
    if(filterItems[type]){
        conf.hide = conf.hide || filterItems[type].hide;
        conf.highlight = conf.highlight || filterItems[type].highlight;
    }
    return conf;
};