var $ = window.$;
var util = require('./util');
var CheckBox = require('./interface/checkbox');

var bind = function(){
    $('.container .add').on('click',function(e){
        var target = $(e.target).parent(),
            id = target.attr('id');
        var left = id == 'rules' ? 0 : 50;
        if(target.hasClass('on')){
            target.css('webkitTransform','translateX('+ (1180 + left)+'px)').removeClass('on');
        }else{
            target.css('webkitTransform','translateX('+ (50+ left) + 'px)').addClass('on');
        }
    });
};

exports.init = function(){
    bind();
}