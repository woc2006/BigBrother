var $ = window.$;
var util = require('./util');
var pageConfig = require('./pageConfig');
var pageRules = require('./pageRules');
var pageSession = require('./pageSessions');
var keyControl = require('./keyControl');

var showPage = function(target,id){
    var left = id == 'rules' ? 200: 800;
    target.css('webkitTransform','translateX('+left+'px)').addClass('on');
}

var hidePage = function(target, id){
    var left = id == 'rules' ? 1180: 1230;
    target.css('webkitTransform','translateX('+left+'px)').removeClass('on');
}

var togglePage = function(target, id){
    var target = target || $('#'+id);
    if(target.hasClass('on')){
        hidePage(target,id);
    }else{
        showPage(target,id);
    }
}

var bind = function(){
    $(window.document.body).on('click','.container',function(e){
        var target = $(this);
        var id = target.attr('id');
        if(id == 'sessions') return;
        var offset = target.offset();
        var delta = e.clientX - offset.left;
        if(delta > 0 && delta < 40){
            togglePage(target, id);
            return false;
        }
    });
    keyControl.on(function(e){
        if(e.ctrlKey){
            switch (e.which){
                case 49:  //1
                    togglePage(null,'rules');
                    break;
                case 50:  //2
                    togglePage(null,'config');
                    break;
            }
        }
        return false;
    });
};


exports.init = function(){
    bind();
    pageSession.init();
    pageRules.init();
    pageConfig.init();

}