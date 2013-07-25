var $ = window.$;
var ejs = require('ejs');

var container = $('#session-list');
var first = true;
var sessionId = 0;
var cached = [];
var maxCache = 100;

var processFirst = function(){
    $('#back-des').hide();
    first = false;
};

var cache = function(session){
    if(first){
        processFirst();
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
    });
};