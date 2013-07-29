var Session = require('../assets/js/pageSessions');
var Config = require('./config');


exports.addSession = function(req, res){
    var item = {
        status: res.statusCode || 500,
        host: req._parsedUrl.hostname,
        path: req._parsedUrl.pathname,
        method: req.method,
        requestHeader: req.headers,
        responseHeader: res.headers || {}
    };
    Config.applyFilter(item);
    Session.addSession(item);
};
