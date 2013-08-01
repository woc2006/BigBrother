var fs = require('fs');
var mime = require('mime');
var sessionBridge = require('./../sessionBridge');
var ProcessRequest = require('./request');



exports.process = function(req, res, file){
    fs.stat(file, function(err, stat){
        if(err || !stat){
            ProcessRequest.process(req, res);
            return;
        }
        if(!stat.isFile()){
            ProcessRequest.process(req, res);
            return;
        }
        fs.readFile(file, function(err, data){
            if(err){
                ProcessRequest(req, res);
                return;
            }
            res.setStatus(200);
            res.setHeader('Content-Length', data.length);
            res.setHeader('Content-Type', mime.lookup(file));
            res.end(data);

            sessionBridge.addSession(req, res, true);
        });
    });
}