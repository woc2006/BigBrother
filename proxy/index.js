var request = require('./request').request;

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
            }else{
                res.writeHead(resp.res.statusCode, resp.res.header);
                res.write(resp.content);
                res.end();
            }
        }
    };
    if(req.method == 'POST'){
        var buffer = [];
        req.on('data',function(chunk){
            buffer.push(chunk);
        });

        req.end('end',function(chunk){
            conf.data = Buffer.concat(buffer);
            sendRequest(conf);
        });
    }else{
        sendRequest(conf);
    }
};