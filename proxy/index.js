var request = require('./request').request;
var Buffer = require('buffer').Buffer;
var session = require('../assets/js/sessions');

var sendRequest = function(conf){
    request(conf);
}

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
                session.addSession({
                    status:500,
                    host:conf.host,
                    query:conf.path
                });
            }else{
                res.writeHead(resp.res.statusCode, resp.res.headers);
                res.write(resp.content);
                res.end();
                session.addSession({
                    status: resp.res.statusCode,
                    host:conf.host,
                    query:conf.path
                });
            }
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