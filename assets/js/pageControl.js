var $ = window.$;
var util = require('./util');

exports.init = function(){
    $('.container .add').on('click',function(e){
        var target = $(e.target).parent(),
            id = target.attr('id');
        var left = id == 'rules' ? 0 : 50;
        if(target.hasClass('on')){
            target.css('webkitTransform','translate3d('+ (1180 + left)+'px,0,0)').removeClass('on');
        }else{
            target.css('webkitTransform','translate3d('+ (50+ left) + 'px,0,0)').addClass('on');
        }
    });

}