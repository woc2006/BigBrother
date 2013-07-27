var $ = window.$;
var document = window.document;

var current;
function CheckBox(){
    current = this;
    this.pool = [];
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
            var id = target.attr('id');
            var val = !target.hasClass('checkbox-on');
            target[val?'addClass':'removeClass']('checkbox-on');
            for(var i=self.pool.length -1;i>=0;i--){
                if(id.match(self.pool[i])){
                    self.pool[i].callback(id, val);
                }
            }
        });
    },

    on: function(match, callback){
        this.pool.push({
            match: match,
            callback: callback
        });
    }


});

exports.CheckBox = CheckBox;