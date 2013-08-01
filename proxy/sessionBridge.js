var Session = require('../assets/js/pageSessions');
var Config = require('./config');


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
        method: req.method,
        requestHeader: req.headers,
        responseHeader: res.res.headers || res.res._headers || {}
    };
    Config.applyFilter(item);
    Session.addSession(item, match);
};
