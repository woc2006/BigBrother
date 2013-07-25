var $ = window.$;

var current;
function CheckBox(){
    current = this;
    this.pool = {};
    this.bind();
}

CheckBox.getInstance = function(){
    if(!current){
        current = new CheckBox();
    }
    return current;
}

CheckBox.methods({
    bind: function(){
        var self = this;
        $(document.body).on('click','.checkbox',function(e){
            var target = $(e.target);
            while(!target.hasClass('checkbox')){
                target = target.parent();
            }
            var id = target.attr('id');
            if(!id || !self.pool[id]) return;
            var val = !target.hasClass('checkbox-on')
            self.changeValue(target,val);
            self.pool[id].onChange.call(self.pool[id].context,val);
        });
    },

    changeValue: function(target, val){
        if(typeof target == 'string'){
            target = $('#'+target);
        }
        if(val){
            target.addClass('checkbox-on').children('.checkboxBar').css('webkitTransform','translate3d(40px,0,0)');
        }else{
            target.removeClass('checkbox-on').children('.checkboxBar').css('webkitTransform','translate3d(0,0,0)');
        }
    },

    getValue: function(target){
        if(typeof target == 'string'){
            target = $('#'+target);
        }
        return !!target.hasClass('checkbox-on');
    },

    on: function(conf){
        conf = $.extend({
            target: '',
            value: false,
            context: this,
            onChange:$.noop
        },conf);
        if(!conf.target) return;
        var $target = $('#'+conf.target);
        if(!$target.length) return;
        $target.html('<div class="checkboxBar animate"></div>');
        this.changeValue($target,conf.value);
        this.pool[conf.target] = conf;
        return conf.target;
    },

    off: function(target){
        if(!target) return;
        if(this.pool[target]){
            delete this.pool[target];
        }
    }
});

exports.CheckBox = CheckBox;