var fs = require('fs');
var mime = require('mime');
var sessionBridge = require('./sessionBridge');
var ProcessRequest = require('./request');



exports.process = function(req, res, file){
    fs.stat(file, function(err, stat){
        if(err || !stat){
            ProcessRequest.process(req, res);
        }
        if(!stat.isFile()){
            ProcessRequest.process(req, res);
        }

        res.statusCode = 200;
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', mime.lookup(file));

        fs.createReadStream(file).pipe(res);
        setTimeout(function(){
            sessionBridge.addSession(req, res, true);
        },0);
    });
}