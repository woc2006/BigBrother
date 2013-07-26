var http = require('http');

exports.request = function(conf){
    var request = http.request({
        host: conf.host,
        port: 80,
        method: conf.method || 'GET',
        path: conf.path || '/',
        headers: conf.headers || []
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

    if(conf.method == 'POST'){
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
}