var $ = window.$;
var util = require('./util');
var pageConfig = require('./pageConfig');
var pageRules = require('./pageRules');
var pageSession = require('./pageSessions');

var showPage = function(target,id){
    var left = id == 'rules' ? 450: 800;
    target.css('webkitTransform','translateX('+left+'px)').addClass('on');
}

var hidePage = function(target, id){
    var left = id == 'rules' ? 1180: 1230;
    target.css('webkitTransform','translateX('+left+'px)').removeClass('on');
}

var bind = function(){
    $('.container .add').on('click',function(e){
        var target = $(e.target).parent(),
            id = target.attr('id');
        if(target.hasClass('on')){
            hidePage(target,id);
        }else{
            showPage(target,id);
        }
    });
};


exports.init = function(){
    bind();
    pageSession.init();
    //pageRules.init();
    pageConfig.init();

}