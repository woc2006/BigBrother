var fs = require('fs');
var mime = require('mime');
var sessionBridge = require('./sessionBridge');
var ProcessRequest = require('./request');


exports.process = function(req, res, files){
    if(!files || !files.length){
        ProcessRequest.process(req, res);
        return;  //should not happen
    }
    var buffers = [];
    var successCount = 0;
    var count = 0;
    var len = files.length;
    var callback = function(data){
        count++;
        if(data){
            successCount++;
            buffers.push(data);
            if(count == len){
                if(!successCount){
                    ProcessRequest.process(req, res);  //route to network
                }else{
                    var result = buffers.join('\r\n');
                    res.statusCode = 200;
                    res.setHeader('Content-Length', result.length);
                    res.setHeader('Content-Type', mime.lookup(file));
                    res.write(result);
                    res.end();
                    setTimeout(function(){
                        sessionBridge.addSession(req, res, true);
                    },0);
                }
            }
        }
    }

    for(var i= 0;i<len;i++){
        var file = files[i];
        fs.stat(file, function(err, stat){
            if(err || !stat){
                callback(null);
                return;
            }
            if(!stat.isFile()){
                callback(null);
                return;
            }
            fs.readFile(file, function(err, data){
                if(err){
                    callback(null);
                    return;
                }
                callback(data);
            });
        });
    }

}