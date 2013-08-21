var LocalStorage = window.localStorage;
var $ = window.$;

var tips = {};
var current = null;

var importTips = function(raw){
    var conf;
    try{
        conf = JSON.parse(raw);
    }catch(e){
        return;
    }
    tips = conf || {};
};

var saveTips = function(){
    var cache = JSON.stringify(tips);
    try{
        LocalStorage.setItem('config-tips',cache);
    }catch(e){}
};

exports.isFirstShow = function(key){
    return !tips[key];
};

exports.init = function(){
    var cache = LocalStorage.getItem('config-tips');
    importTips(cache);

    $('#tips').on('click','.tips',function(e){
        $(this).fadeOut(300);
    });
};

exports.showTips = function(key, conf){
    conf = $.extend({
        top:0,
        left:0,
        max: 1
    }, conf);
    if(tips[key] && tips[key] >= conf.max) return;
    conf.top = Math.max(10, Math.min(620, conf.top));
    conf.left = Math.max(10, Math.min(1000, conf.left));
    if(!tips[key]){
        tips[key] = 1;
    }else{
        tips[key] = tips[key] + 1;
    }
    if(current){
        current.hide();
    }
    current = $('#tips-'+key);
    current.css({
        top: conf.top + 'px',
        left: conf.left + 'px'
    }).fadeIn(300);
    setTimeout(function(){
        saveTips();
    },0);
};