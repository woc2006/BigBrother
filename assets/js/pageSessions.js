var $ = window.$;
var ejs = require('ejs');
var Style = require('../../proxy/config').getRuleStyle();

var container = $('#session-list');
var first = true;
var sessionId = 0;
var maxCache = 200;
var currentDisplayed = 0;
var cached = [];
var cachedEx = [];

var processFirst = function(){
    $('#back-des').hide();
    first = false;
};

var cache = function(session){
    if(first){
        processFirst();
    }
    if(cached.length == maxCache*2){
        cached.splice(0,maxCache);
    }
    cached.push(session);
}

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
            //TODO: need timeout
            container.children(':first').remove();
            currentDisplayed--;
        }
    });
};

exports.init = function(){
    container.on('click','li',function(e){
        var target = $(this);
            idRaw = target.attr('id');
        var id = /session-(.+)/.exec(idRaw);
        if(!id) return;
        id = parseInt(id[1]);
        var targetEx = target.next('.ex');
        if(!targetEx.length){
            //render a new ex item
            var session;
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
};