var fs = require('fs');
var sessionBridge = require('./sessionBridge');


exports.process = function(req, res, file){
    fs.stat(file, function(err, stat){
        if(err){
            return false;
        }
        if(!stat.isFile()){
            return false;
        }

        res.statusCode = 200;
        res.setHeader('Content-Length', stat.size);
        //res.setHeader('Content-Type', mime.lookup(filePath));

        fs.createReadStream(filePath).pipe(res);
        setTimeout(function(){
            sessionBridge.addSession(req, res);
        },0);
    });
}