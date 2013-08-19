var $ = window.$;
var ejs = require('ejs');
var Style = require('../../proxy/config').getRuleStyle();
var Tips = require('./tipsControl');
var gui = window.require('nw.gui');
var Clipboard = gui.Clipboard.get();

var container = $('#session-list');
var sessionId = 0;
var maxCache = 200;
var currentDisplayed = 0;
var cached = [];
var cachedEx = [];

var regId = /session-(\d+)/;

var cache = function(session){
    if(cached.length == maxCache*2){
        cached.splice(0,maxCache);
    }
    cached.push(session);
};

var getSessionById = function(id){
    if(typeof id == 'undefined') return null;
    var session = null;
    //search in reversed order
    for(var i=cached.length -1;i>=0;i--){
        var _id = cached[i].id;
        if(_id > id) continue;
        if(_id < id) break;
        if(_id == id){
            session = cached[i];
            break;
        }
    }
    return session;
};

var buildUrlFromSession = function(session){
    var url = 'http://' + session.host + session.path;  //ignore https now.
    if(session.query){
        url += '?';
        for(var key in session.query){
            url += key + '=' + session.query[key];
        }
    }
    return url;
};

var lastUpdateStatus = 0;
var updateStatus = function(){
    if(currentDisplayed == 0 && lastUpdateStatus != 0){
        $('#session-tool').fadeOut(300);
    }else if(lastUpdateStatus == 0 && currentDisplayed != 0){
        $('#session-tool').fadeIn(300);
    }
    lastUpdateStatus = currentDisplayed;
    $('#session-count').text(currentDisplayed);
};

exports.addSession = function(session, match){
    if(!session || !session.status){
        return;
    }
    if(session.hide) return;
    session.id = sessionId++;
    cache(session);
    ejs.renderFile('assets/tmpl/sessionItem.ejs',{session: session, match: match? Style : null},function(err,html){
        container.append(html);
        currentDisplayed++;
        if(currentDisplayed > maxCache){
            container.children(':first').remove();
            currentDisplayed--;
        }
        updateStatus();
    });
};

exports.init = function(){
    Tips.showTips('start',{
        left: 420,
        top: 320
    });
    container.on('click','li',function(e){
        var target = $(this),
            idRaw = target.attr('id');
        var id = regId.exec(idRaw);
        if(!id) return;
        id = parseInt(id[1]);
        var targetEx = target.next('.ex');
        if(!targetEx.length){
            //render a new ex item
            var session = getSessionById(id);
            if(!session) return;
            ejs.renderFile('assets/tmpl/sessionItemEx.ejs',session,function(err,html){
                targetEx = $(html);
                target.after(targetEx);
                targetEx.slideDown(300);
                //cache the node, and remove old items.
                cachedEx.push(targetEx);
                if(cachedEx.length > 20){
                    var old = cachedEx.shift();
                    if(old) old.remove();
                }
            });
        }else{
            targetEx.slideToggle(300);
        }
    });

    container.on('click','img',function(e){
        e.stopPropagation();
        var target = $(this),
            tool = target.data('tool');
        var parent = target.parent().parent(),//li
            id = regId.exec(parent.attr('id'));
        id = parseInt(id[1]);
        var session = getSessionById(id);
        if(!session || !tool) return;
        switch (tool){
            case 'copy':
                var url = buildUrlFromSession(session);
                Clipboard.set(url,'text');
                break;
            case 'delete':
                var next = parent.next('.ex');
                next.slideUp(300);
                parent.slideUp(300).promise().done(function(){
                    parent.remove();
                    next.remove();
                    currentDisplayed--;
                    updateStatus();
                });
                break;
        }
    });

    $('#session-tool').on('click','img',function(e){
        e.stopPropagation();
        var target = $(this),
            tool = target.data('tool');
        if(!tool) return;
        switch (tool){
            case 'delete':
                cached = [];
                cachedEx = [];
                currentDisplayed = 0;
                updateStatus();
                container.html('');
                break;
        }
    })

    container.on('mouseenter','li',function(e){
        var target = $(this);
        container.find('.sessionTool-hover').removeClass('sessionTool-hover');
        if(target.hasClass('ex')) return;
        target.find('.sessionTool').addClass('sessionTool-hover');
    });

    container.on('mouseleave','li',function(e){
        container.find('.sessionTool-hover').removeClass('sessionTool-hover');
    });

    container.on('click','.title4',function(e){
        var target = $(this);
        if(target.hasClass('titleHide')){
            target.removeClass('titleHide');
            target.next('dl').slideDown(300);
        }else{
            target.addClass('titleHide');
            target.next('dl').slideUp(300);
        }
    })
};