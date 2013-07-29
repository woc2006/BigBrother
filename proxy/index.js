var request = require('./request').request;
var Buffer = require('buffer').Buffer;
var Rules = require('./rule');
var ProcessRequest = require('./request');
var ProcessReplace = require('./replace');
var ProcessCombo = require('./combo');

exports.process = function(req, res){
   var url = req._parsedUrl.hostname + req._parsedUrl.pathname;

   var urls = Rules.matchRule(url);
   if(!urls || !urls.length){
       ProcessRequest.process(req, res);
   }else if(urls.length == 1){
       if(!ProcessReplace.process(req, res, urls[0])){
           ProcessRequest.process(req, res);
       }
   }else{
       if(!ProcessCombo.process(req, res, urls)){
           ProcessCombo.process(req, res);
       }
   }
};
