var $ = window.$
var ejs = require('ejs');
var Config = require('../../proxy/config');
var CheckBox = require('./interface/checkbox').CheckBox.getInstance();

var canvasInit = function(){
    //draw color pattern
    var canvas = $('#style-picker'),
        ctx = canvas[0].getContext('2d');
    var size = 200;
    var pixel = ctx.getImageData(0,0,size,size);
    for(var i=0;i<size;i++){
        for(var j=0;j<size;j++){
            var start = (i*200+j)*4;
            var r = Math.floor(i / 200 * 255),
                g = Math.floor(j / 200 * 255),
                b = Math.floor((200 - i) / 200 * 255);
            pixel.data[start] = r;
            pixel.data[start+1] = g;
            pixel.data[start+2] = b;
            pixel.data[start+3] = 255;
        }
    }
    ctx.putImageData(pixel,0,0);

    //bind
    $('#style-color').on('click',function(){
        if(canvas.css('display') == 'block'){
            canvas.hide(300);
        }else{
            canvas.show(300);
        }
    });

    canvas.on('click',function(e){
        var x = Math.max(0,Math.min(size, e.offsetX)),
            y = Math.max(0,Math.min(size, e.offsetY));
        var pixel = ctx.getImageData(x,y,1,1).data;
        var color = ['rgb(',pixel[0],',',pixel[1],',',pixel[2],')'].join('');
        $('#style-color').css('backgroundColor',color);
        canvas.hide(300);
        Config.updateRuleStyle('color',color);
    });
};

exports.init = function(){
    var _config = Config.getFilterItems();
    ejs.renderFile('assets/tmpl/filter.ejs',{
        prefix:'hide',
        items: _config
    },function(err,html){
        if(err){
            console.log('render error');
            return;
        }
        $('#config-hide .configBody').html(html);
    });
    ejs.renderFile('assets/tmpl/filter.ejs',{
        prefix:'highlight',
        items: _config
    },function(err,html){
        if(err){
            console.log('render error');
            return;
        }
        $('#config-high .configBody').html(html);
    });
    _config = Config.getRuleStyle();
    ejs.renderFile('assets/tmpl/ruleStyle.ejs',_config,function(err,html){
        if(err){
            console.log('render error');
            return;
        }
        $('#config-style .configBody').html(html);
    });
    CheckBox.on(/^hide-/,function(id,val){
        var id = id.match(/hide-(.+)/);
        if(id && id[1]){
            Config.updateConfig(id[1],'hide',val);
        }
    });

    CheckBox.on(/^highlight-/,function(id,val){
        var id = id.match(/highlight-(.+)/);
        if(id && id[1]){
            Config.updateConfig(id[1],'highlight',val);
        }
    });

    CheckBox.on(/^style-/,function(id,val){
        var id = id.match(/style-(.+)/);
        if(id && id[1]){
            Config.updateRuleStyle(id[1], val);
        }
    });

    canvasInit();
}