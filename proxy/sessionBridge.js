var Session = require('../assets/js/pageSessions');
var Config = require('./config');

var regCookieSplit = /([^\=\s]*)\=(.+)/;
/**
 *
 * @param req
 * @param res  responseItem
 * @param match {Boolean}
 */
exports.addSession = function(req, res, match){
    var item = {
        status: res.res.statusCode || 500,
        host: req._parsedUrl.hostname,
        path: req._parsedUrl.pathname,
        query: req.paramQuery,
        data: req.paramPost,
        method: req.method,
        requestHeader: req.headers,
        responseHeader: res.res.headers || res.res._headers || res.res._header || {}
    };
    if(typeof item.responseHeader == 'string'){
        var arr = item.responseHeader.split(/\r\n/g);
        var headers = {};
        for(var i= 0,len = arr.length;i<len;i++){
            if(arr[i].indexOf(':') < 0) continue;
            var pair = arr[i].split(':');
            headers[pair[0]] = pair[1];
        }
        item.responseHeader = headers;
    }
    if(item.requestHeader && item.requestHeader['cookie']){
        var _cookie = item.requestHeader['cookie'];
        delete item.requestHeader['cookie'];
        item.cookie = {};
        var arr = _cookie.split(';');
        for(var i= 0,len = arr.length;i<len;i++){
            var pair = regCookieSplit.exec(arr[i]);
            if(!pair || pair.length != 3) continue;
            item.cookie[pair[1]] = pair[2];
        }
    }
    Config.applyFilter(item);
    Session.addSession(item, match);
};
