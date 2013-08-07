var http = require('http');
var Buffer = require('buffer').Buffer;
var sessionBridge = require('./../sessionBridge');

var timeout = {
    'GET': 30000,
    'POST': 60000
}
var sendRequest = function(conf){
    var method = conf.method || 'GET';

    var request = http.request({
        host: conf.host,
        port: conf.port,
        method: method,
        path: conf.path || '/',
        headers: conf.headers || {}
    },function(res){
        clearTimeout(requestTimeout);
        var responseTimeout = setTimeout(function(){
            request.abort();
            conf.callback({error: 'response timeout'});
        }, timeout[method]);

        var buffers = [];
        res.on('data', function(chunk){
            buffers.push(chunk);
        });

        res.on('end', function(){
            res.removeAllListeners('data');
            res.removeAllListeners('end');
            clearTimeout(responseTimeout);
            conf.callback({
                res: res,
                content: Buffer.concat(buffers)
            });
        });
    });

    if(conf.method === 'POST'){
        request.write(conf.data);
    }

    var requestTimeout = setTimeout(function(){
        request.abort();
        conf.callback({error: 'request timeout'});
    },timeout[method]);

    request.on('error',function(err){
        clearTimeout(requestTimeout);
        request.abort();
        conf.callback({error: 'internal error'});
    });

    request.end();
};


exports.process = function(req, res){
    var conf = {
        host: req._parsedUrl.hostname,
        port: req._parsedUrl.port,
        path: req._parsedUrl.path,
        method: req.method,
        headers: req.headers,
        data: req.postData || null,
        callback: function(resp){
            if(resp.error){
                res.writeHead(500,{});
                res.end();
            }else{
                res.writeHead(resp.res.statusCode, resp.res.headers);
                res.end(resp.content);
            }
            sessionBridge.addSession(req, res || {});
        }
    };

    sendRequest(conf);
    return true;
};