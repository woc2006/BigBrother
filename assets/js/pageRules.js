var $ = window.$
var ejs = require('ejs');
var Config = require('../../proxy/rule');
var CheckBox = require('./interface/checkbox').CheckBox.getInstance();

var groupList = $('#group-list');
var ruleList = $('#rule-list');

var currentGroup = '';
var groupLock = false;  //lock group changes

var regGroup = /groupItem-(.+)/;
var regRule = /ruleItem-(.+)/;

var groupInit = function(){
    groupList.on('click','li',function(e){
        if(groupLock) return;
        if($(e.target).hasClass('checkbox')) return;
        var target = $(this);
        if(target.hasClass('new')){
            //build a new item
            ejs.renderFile('assets/tmpl/groupEdit.ejs',{val: '', fake: true},function(err,html){
                if(err){
                    console.log('render error');
                    return;
                }
                currentGroup = '';
                swapRules(true); //clear all rules
                var newItem = $(html);
                target.before(newItem);
                newItem.slideDown(300);
                groupLock = true;
            });
        }else if(!target.hasClass('current')){
            var id = target.children('.checkbox').attr('id');
            if(!id) return;
            currentGroup = regGroup.exec(id)[1]; //this is horrible
            swapRules(true);
        }
    });

    groupList.on('dblclick','li',function(e){
        if(groupLock) return;
        var target = $(this),
            old = target.children('span'),
            val = old.text();
        if(val == 'Default') return;
        old.remove();
        ejs.renderFile('assets/tmpl/groupEdit.ejs',{val: val, fake: false},function(err,html){
            if(err){
                console.log('render error');
                return;
            }
            target.append(html);
            groupLock = true;
        });
    });

    groupList.on('click','img',function(e){
        e.stopPropagation();
        var target = $(this).parent();//li
        if(target.hasClass('new')) return;
        Config.updateGroup(currentGroup,null,null);
        //find next item
        currentGroup = '';
        var next = target.prev();
        if(!next.length){
            next = target.next();
        }
        if(!next.hasClass('new')){
            var id = next.children('.checkbox').attr('id');
            currentGroup = id ? regGroup.exec(id)[1] : '';
        }
        target.remove();
        swapRules(true); //unlock in swap
    });

    var editConfirm = function(target){
        var val = $.trim(target.val());
        if(!val) return;
        val = encodeURIComponent(val);
        if(val != currentGroup){
            if(!Config.updateGroup(currentGroup,val,null)) return;
        }
        currentGroup = val;
        var parent = target.parent();
        //modify the old one
        target.remove();
        parent.children('img').remove();
        parent.append('<span>'+val+'</span>');
        parent.children('.checkbox').attr('id','groupItem-'+val);
        swapRules(true);   //unlock in swap
    };

    groupList.on('keypress','input',function(e){
        if(e.keyCode == 13){
            editConfirm($(this));
        }
    });
};

var swapRules = function(transition){
    groupLock = true;
    groupList.children('li.current').removeClass('current');
    if(!currentGroup){
        //clear all rules
        ruleList.children(':not(.new)').remove();
        groupLock = false;
        return;
    }
    $('#groupItem-'+currentGroup).parent().addClass('current');
    ejs.renderFile('assets/tmpl/rule.ejs', Config.getRules(currentGroup),function(err,html){
        if(err){
            console.log('render error');
            return;
        }

        if(transition){
            var old = ruleList.children(':not(.new)');
            old.animate({
                'opacity':'0'
            },300).promise().done(function(){
                old.remove();
                var newItem = $(html);
                ruleList.children('.new').before(newItem);
                newItem.fadeIn(300);
                groupLock = false;
            });
        }else{
            ruleList.children('.new').before(html);
            groupLock  = false;
        }
    });
}

exports.init = function(){
    var _config = Config.getGroups();
    ejs.renderFile('assets/tmpl/group.ejs',{groups: _config},function(err,html){
        if(err){
            console.log('render error');
            return;
        }
        groupList.children('.new').before(html);
    });
    //mark first enabled group as current and display it's rules
    var firstKey = '';
    for(var key in _config){
        if(_config[key].enable){
            firstKey = key;
            break;
        }
    }
    if(firstKey){
        currentGroup = firstKey;
        swapRules(false);
    }

    CheckBox.on(/groupItem/,function(id,val){
        var id = id.match(regGroup);
        if(id && id[1]){
            Config.updateGroup(id[1],null,val);
        }
    });

    CheckBox.on(/ruleItem/,function(id,val){
        var id = id.match(regRule);
        if(id && id[1] && currentGroup){
            Config.updateRule(currentGroup,id[1],{enable:val});
        }
    });

    groupInit();
};