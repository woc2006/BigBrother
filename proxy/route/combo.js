var fs = require('fs');
var mime = require('mime');
var sessionBridge = require('./../sessionBridge');
var ProcessRequest = require('./request');
var Buffer = require('buffer').Buffer;


exports.process = function(req, res, files, remote){
    if(!files || !files.length){
        ProcessRequest.process(req, res);
        return;  //should not happen
    }
    var len = files.length;
    var buffers = new Array(len);
    var successCount = 0;
    var count = 0;
    var type = mime.lookup(files[0]);

    var callback = function(index,data){
        count++;
        if(data){
            successCount++;
            buffers[index] = data;
        }else{
            buffers[index] = new Buffer(0);
        }
        if(count == len){
            var result = Buffer.concat(buffers);
            res.setStatus(200);
            res.setHeader('Content-Length', result.length);
            res.setHeader('Content-Type', type);
            res.end(result);
            sessionBridge.addSession(req, res, true);
        }
    }

    for(var i= 0;i<len;i++){
        (function(index){
            var file = files[index];
            fs.stat(file, function(err, stat){
                if(err || !stat || !stat.isFile()){
                    //get single file from remote server
                    ProcessRequest.getDataFromUrl(remote[index], function(data){
                        callback(index, data);
                    });
                    return;
                }
                fs.readFile(file, function(err, data){
                    if(err){
                        callback(-1, null);
                        return;
                    }
                    callback(index, data);
                });
            });
        })(i);
    }

}