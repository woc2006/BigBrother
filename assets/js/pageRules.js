var $ = window.$
var ejs = require('ejs');
var Config = require('../../proxy/rule');
var Tips = require('./tipsControl');
var Util = require('./util');
var CheckBox = require('./interface/checkbox').CheckBox.getInstance();

var groupList = $('#group-list');
var ruleList = $('#rule-list');
var SelFile = $('#edit-file');
var SelDir = $('#edit-dir');

var currentGroup = '';
var groupLock = false;  //lock group changes

var regGroup = /groupItem-(.+)/;
var regRule = /ruleItem-(.+)/;
var regWrongChar = /[\>\<\'\"\r\n&]/g;

var removeEditor = function(target){
    target = target || $('#rule-edit');
    if(!target.length) return;
    target.slideUp().promise().done(function(){
        target.remove();
    });
};

//entrance of all rules creation
var getEditResult = function(target){
    target = target || $('#rule-edit');
    var conf = {
        source: $('#edit-source').val().trim(),
        dest: $('#edit-dest').val().trim(),
        prefix:'',
        separator:'',
        additional: 0,
        speed: ~~parseInt($('#edit-speed').val().trim())
    };
    if($('#edit-combo').hasClass('checkbox-on')){
        conf.prefix = $('#edit-prefix').val().trim();
        conf.separator = $('#edit-separator').val().trim();
    }
    if($('#edit-headers').hasClass('checkbox-on')){
        conf.additional |= Config.additionRule.crossDomain;
    }
    if($('#edit-pause-req').hasClass('checkbox-on')){
        conf.additional |= Config.additionRule.requestPause;
    }
    if($('#edit-pause-res').hasClass('checkbox-on')){
        conf.additional |= Config.additionRule.responsePause;
    }
    if($('#edit-continue').hasClass('checkbox-on')){
        conf.additional |= Config.additionRule.continues;
    }
    return conf;
};

/**
 *
 * @param target #rule-list li
 */
var getTargetId = function(target, isGroup){
    var id = target.children('.checkbox').attr('id');
    if(!id) return '';
    if(isGroup){
        return regGroup.exec(id)[1];  //id should be well formated
    }else{
        return regRule.exec(id)[1];
    }
};

//remove all html tags from str
var filterInput = function(str){
    return str.replace(regWrongChar,'');
};

var inputContainsWrongChar = function(str){
    var match = regWrongChar.exec(str);
    if(match){
        return true;
    }
    return false;
}

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
                var newItem = $(html).hide();
                target.before(newItem);
                newItem.slideDown(300);
                groupLock = true;
            });
        }else if(!target.hasClass('current')){
            currentGroup = getTargetId(target, true);
            swapRules(true);
        }
    });

    groupList.on('mouseenter','li',function(e){
        var target = $(this);
        groupList.find('.groupItem-tool-hover').removeClass('groupItem-tool-hover');
        if(target.hasClass('new')) return;
        if(target.children('span').text() == 'Default') return;
        target.find('.groupItem-tool').addClass('groupItem-tool-hover');
    });

    groupList.on('mouseleave','li',function(e){
        groupList.find('.groupItem-tool-hover').removeClass('groupItem-tool-hover');
    });

    //rename is not a frequently operation, use another trigger method.
    groupList.on('dblclick','li',function(e){
        if(groupLock) return;
        if($(e.target).hasClass('checkbox')) return;
        var target = $(this),
            old = target.children('span'),
            val = old.text();
        if(target.hasClass('new')) return;
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
        var target = $(this).parents('li');
        if(target.hasClass('new')) return;
        var id = getTargetId(target,true);
        if(id && !window.confirm("Do you wish to delete this group?")) return;
        Util.imgClickEffect(this);
        Config.updateGroup(id,null,null);
        if(currentGroup == id){
            //find next item
            currentGroup = '';
            var next = target.prev();
            if(!next.length){
                next = target.next();
            }
            if(!next.hasClass('new')){
                currentGroup = getTargetId(next, true);
            }
        }

        target.slideUp().promise().done(function(){
            target.remove();
        });
        swapRules(true); //unlock in swap
    });

    var editConfirm = function(target){
        var val = $.trim(target.val());
        var parent = target.parent();
        if(!val) return;
        if(inputContainsWrongChar(val)){
            var offset = parent.offset();
            Tips.showTips('wrongChar',{
                left: offset.left,
                top: offset.top + 24,
                max: 999
            });
            return;
        }
        val = filterInput(val);
        var _config;
        if(val != currentGroup){
            _config = Config.updateGroup(currentGroup, val, null);
            if(!_config) return;
        }
        currentGroup = val;
        var groups = {};
        groups[val] = _config;
        ejs.renderFile('assets/tmpl/group.ejs',{groups: groups},function(err,html){
            if(err){
                console.log('render error');
                return;
            }
            var newItem = $(html);
            parent.replaceWith(newItem);
        });

        swapRules(true);   //unlock in swap
    };

    groupList.on('keypress','input',function(e){
        if(e.keyCode == 13){
            editConfirm($(this));
        }
    });

};

var ruleInit = function(){
    ruleList.on('click','li',function(e){
        if($(e.target).hasClass('checkbox')) return;
        var target = $(this);
        if(target.attr('id') == 'rule-edit') return;
        if(target.hasClass('current')){
            removeEditor();
            target.removeClass('current');
            return;
        }
        //another editor exist and belong to a rule item
        var currentRule = ruleList.children('li.current');
        var currentEditor = $('#rule-edit');
        //an existed new rule editor
        if(!currentRule.length && currentEditor.length && target.hasClass('new')){
            return;
        }
        currentRule.removeClass('current');
        removeEditor();

        if(target.hasClass('new')){
            //build a new item
            ejs.renderFile('assets/tmpl/ruleEdit.ejs',{},function(err,html){
                if(err){
                    console.log('render error');
                    return;
                }
                var newItem = $(html);
                target.before(newItem);
                newItem.slideDown(300).promise().done(function(){
                    if(Tips.isFirstShow('rule')){
                        var offset = $('#rule-edit').offset();
                        Tips.showTips('rule',{
                            top: offset.top,
                            left:offset.left + 164
                        });
                    }
                })
            });
        }else{
            var id = getTargetId(target);
            if(!id) return;
            var conf = Config.getRule(currentGroup,id);
            if(!conf) return;
            target.addClass('current');
            ejs.renderFile('assets/tmpl/ruleEdit.ejs',conf,function(err,html){
                if(err){
                    console.log('render error');
                    return;
                }
                var newItem = $(html);
                target.after(newItem);
                newItem.slideDown(300);
            });
        }
    });

    ruleList.on('mouseenter','li',function(e){
        if($('#rule-edit').length) return;
        var target = $(this);
        ruleList.find('.ruleItem-tool-hover').removeClass('ruleItem-tool-hover');
        if(target.hasClass('new')) return;
        target.find('.ruleItem-tool').addClass('ruleItem-tool-hover');
    });

    ruleList.on('mouseleave','li',function(e){
        ruleList.find('.ruleItem-tool-hover').removeClass('ruleItem-tool-hover');
    });

    ruleList.on('dblclick','input',function(e){
        var target = $(this),
            id = target.attr('id');
        if(id != 'edit-dest') return;
        var source = $('#edit-source').val().trim();
        if(source[source.length - 1] == '/'){
            SelDir.trigger('click');
        }else{
            SelFile.trigger('click');
        }
    });

    ruleList.on('click','img',function(e){
        e.stopPropagation();
        var target = $(this).parent().parent();//li
        var prev = target.prev();//maybe li.current
        var tool = $(this).data('tool');
        Util.imgClickEffect(this);
        switch (tool){
            case 'ok':
                removeEditor();
                var conf = getEditResult(target);
                if(!conf.source){
                    $('#edit-source').focus();
                    return;
                }
                if(!prev.length || !prev.hasClass('current')){
                    //new rule
                    var conf = Config.updateRule(currentGroup,null,conf);
                    ejs.renderFile('assets/tmpl/rule.ejs',{rules:[conf]},function(err,html){
                        if(err){
                            console.log('render error');
                            return;
                        }
                        var newItem = $(html);
                        target.before(newItem);
                    });
                }else{
                    var id = getTargetId(prev);
                    if(!id) return;
                    conf.id = id;
                    conf = Config.updateRule(currentGroup,id,conf);
                    ejs.renderFile('assets/tmpl/rule.ejs',{rules:[conf]},function(err,html){
                        if(err){
                            console.log('render error');
                            return;
                        }
                        var newItem = $(html);
                        prev.replaceWith(newItem);
                    });
                }
                break;
            case 'cancel':
                removeEditor();
                if(prev.length && prev.hasClass('current')){
                    prev.removeClass('current');
                }
                break;
            case 'copy':
                var id = getTargetId(target);
                if(!id) return;
                var conf = Config.getRule(currentGroup, id);
                var newConf = Config.updateRule(currentGroup, null, $.extend({},conf));
                var result = Config.changeRuleOrder(currentGroup, newConf.id, conf.id,1);  //should always be true
                if(!result){
                    Config.updateRule(currentGroup,newConf, null);  //delete it
                    return;
                }
                ejs.renderFile('assets/tmpl/rule.ejs',{rules:[newConf]},function(err,html){
                    if(err){
                        console.log('render error');
                        return;
                    }
                    var newItem = $(html).hide();
                    target.after(newItem);
                    newItem.slideDown(300);
                });
                break;
            case 'up':
            case 'down':
                var id = getTargetId(target);
                if(!id) return;
                var flag = tool == 'up' ? -1 : 1;
                var result = Config.changeRuleOrder(currentGroup,id,null,flag);
                if(result){
                    var another = flag == -1 ? target.prev() : target.next();
                    target.addClass('animate').css('webkitTransform','translateY('+(28*flag)+'px)');
                    another.addClass('animate').css('webkitTransform','translateY('+(-28*flag)+'px)');
                    target.on('webkitTransitionEnd',function(){
                        target.removeClass('animate').css('webkitTransform','');
                        another.removeClass('animate').css('webkitTransform','');
                        target.off('webkitTransitionEnd');
                        if(flag == -1){
                            target.after(another);
                        }else{
                            target.before(another);
                        }
                    });
                }
                break;
            case 'delete':
                if(!window.confirm("Do you wish to delete this rule?")) return;
                removeEditor();
                var id = getTargetId(target);
                if(!id) return;
                Config.updateRule(currentGroup,id, null);
                target.slideUp(300).promise().done(function(){
                    target.remove();
                });
                break;
        }
    });

    CheckBox.on(/^edit-combo$/,function(id,val){
        var target = $('#rule-edit');
        if(!target.length) return;
        if(val){
            target.find('#edit-combo-sub').slideDown(300);
            var offset = target.offset();
            Tips.showTips('combo',{
                top: offset.top + 26,
                left:offset.left + 264
            });
        }else{
            target.find('#edit-combo-sub').slideUp(300);
        }
    });

    CheckBox.on(/^edit-addition/,function(id,val){
        var target = $('#rule-edit');
        if(!target.length) return;
        if(val){
            target.find('#edit-addition-sub').slideDown(300);
        }else{
            target.find('#edit-addition-sub').slideUp(300);
        }
    });

    var changeDestValue = function(){
        var dest = $('#edit-dest');
        if(!dest.length) return;
        var target = $(this);
        var val = target.val().trim();
        target.val('');
        if(val){
            dest.val(val);
        }
    }

    SelFile.change(changeDestValue);

    SelDir.change(changeDestValue);
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
            var editItem = ruleList.children('.new');
            if(old.length){
                editItem.fadeOut(300);
            }
            old.fadeOut(300).promise().done(function(){
                old.remove();
                var newItem = $(html).hide();
                editItem.before(newItem).fadeIn(300);
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

    CheckBox.on(/^groupItem/,function(id,val){
        var id = id.match(regGroup);
        if(id && id[1]){
            Config.updateGroup(id[1],null,val);
        }
    });

    CheckBox.on(/^ruleItem/,function(id,val){
        var id = id.match(regRule);
        if(id && id[1] && currentGroup){
            Config.updateRule(currentGroup,id[1],{enable:val});
        }
    });

    groupInit();
    ruleInit();
};