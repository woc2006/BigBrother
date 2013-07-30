var Rules = require('./rule');
var ProcessRequest = require('./request');
var ProcessReplace = require('./replace');
var ProcessCombo = require('./combo');

exports.process = function(req, res){
    req._parsedUrl.hostname = req._parsedUrl.hostname || '127.0.0.1';
    req._parsedUrl.pathname = req._parsedUrl.pathname || '/';
    var url = req._parsedUrl.hostname + req._parsedUrl.pathname;

    var urls = Rules.matchRule(url);
    if(!urls || !urls.length){
        ProcessRequest.process(req, res);
    }else if(urls.length == 1){
        ProcessReplace.process(req, res, urls[0]);
    }else{
        ProcessCombo.process(req, res, urls);
    }
};
