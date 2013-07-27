var request = require('./request').request;
var Buffer = require('buffer').Buffer;
var Session = require('../assets/js/pageSessions');
var Config = require('./config');

var sendRequest = function(conf){
    request(conf);
};

var buildCacheSession = function(req, res){
    var item = {
        status: res.statusCode || 500,
        host: req._parsedUrl.hostname,
        path: req._parsedUrl.pathname,
        method: req.method,
        requestHeader: req.headers,
        responseHeader: res.headers || {}
    };
    return Config.applyFilter(item);
};

exports.process = function(req, res){
    var conf = {
        host: req._parsedUrl.hostname,
        path: req._parsedUrl.pathname,
        method: req.method,
        headers: req.headers,
        callback: function(resp){
            if(resp.error){
                res.writeHead(500,resp.error);
                res.end();
            }else{
                res.writeHead(resp.res.statusCode, resp.res.headers);
                res.write(resp.content);
                res.end();
            }
            setTimeout(function(){
                Session.addSession(buildCacheSession(req, resp.res || {}));
            },0);
        }
    };
    if(req.method === 'POST'){
        var buffer = [];
        req.on('data',function(chunk){
            buffer.push(chunk);
        });

        req.on('end',function(chunk){
            conf.data = Buffer.concat(buffer);
            sendRequest(conf);
        });
    }else{
        sendRequest(conf);
    }
};
