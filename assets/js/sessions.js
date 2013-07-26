var $ = window.$;
var ejs = require('ejs');

var container = $('#session-list');
var first = true;
var sessionId = 0;
var maxCache = 200;
var currentDisplayed = 0;
var cached = new Array(maxCache*2);

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

exports.addSession = function(session){
    if(!session || !session.status){
        return;
    }
    session = $.extend({
        id : sessionId++,
        status: 200,
        host: '',
        query:'/'
    },session);
    cache(session);
    ejs.renderFile('assets/tmpl/sessionItem.ejs',session,function(err,html){
        container.append(html);
        currentDisplayed++;
        if(currentDisplayed > maxCache){
            //TODO: need timeout
            container.children(':first').remove();
            currentDisplayed--;
        }
    });
};