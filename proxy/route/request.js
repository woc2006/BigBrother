var Url = require('url');
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

    if(conf.method === 'POST' && conf.data){
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
            sessionBridge.addSession(req, res || {},res && res.matched);
        }
    };

    sendRequest(conf);
    return true;
};

exports.processDefaultReturn = function(req, res, status){
    res.setStatus(status);
    res.end();
    sessionBridge.addSession(req,res || {},res && res.matched);
};

exports.processAnotherUrl = function(req, res, url){
    var _parsed = Url.parse(url);
    var conf = {
        host: _parsed.hostname,
        port: _parsed.port || 80,
        path: _parsed.path || '/',
        method: req.method,
        headers: req.headers,
        data: req.postData || null,
        callback: function(resp){
            if(resp.error){
                exports.process(req, res);
            }else{
                res.writeHead(resp.res.statusCode, resp.res.headers);
                res.end(resp.content);
                sessionBridge.addSession(req, res || {}, res && res.matched);
            }
        }
    };
    conf.headers['host'] = conf.host;
    sendRequest(conf);
    return true;
};

exports.getDataFromUrl = function(url, callback){
    var _parsed = Url.parse(url);
    var conf = {
        host: _parsed.hostname,
        port: _parsed.port || 80,
        path: _parsed.path || '/',
        method: 'GET',
        headers: [],
        data: null,
        callback: function(resp){
            if(resp.error || resp.res.statusCode >= 400 || !resp.content.length){
                callback(null);
            }else{
                callback(resp.content);
            }
        }
    };
    conf.headers['host'] = conf.host;
    sendRequest(conf);
}