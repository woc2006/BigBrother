var http = require('http');
var Buffer = require('buffer').Buffer;
var sessionBridge = require('./../sessionBridge');


var sendRequest = function(conf){
    var request = http.request({
        host: conf.host,
        port: 80,
        method: conf.method || 'GET',
        path: conf.path || '/',
        headers: conf.headers || {}
    },function(res){
        clearTimeout(requestTimeout);
        var responseTimeout = setTimeout(function(){
            request.abort();
            conf.callback({error: 'response timeout'});
        },30000);

        var buffers = [];
        res.on('data', function(chunk){
            buffers.push(chunk);
        });

        res.on('end', function(){
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
    },15000);

    request.on('error',function(err){
        conf.callback({error: 'internal error'});
    });

    request.end();
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
                res.end(resp.content);
            }
            sessionBridge.addSession(req, res || {});
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
    return true;
};