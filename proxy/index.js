var Url = require('url');
var Rules = require('./rule');
var ProcessRequest = require('./route/request');
var ProcessReplace = require('./route/replace');
var ProcessCombo = require('./route/combo');
var ResponseItem = require('./responseItem').ResponseItem;
var RequestItem = require('./requestItem').RequestItem;

var regHttp = /^http/;

exports.process = function(req, res){
    req._parsedUrl = Url.parse(req.url);
    req._parsedUrl.hostname = req._parsedUrl.hostname || '127.0.0.1';
    req._parsedUrl.path = req._parsedUrl.path || '/';
    req._parsedUrl.pathname = req._parsedUrl.pathname || '/';
    req._parsedUrl.protocol = req._parsedUrl.protocol || 'http:';
    req._parsedUrl.port = req._parsedUrl.port || 80;
    var url = req.url;

    var matched = Rules.matchRule(url);
    var reqItem = new RequestItem(req, res, matched, function(_req, _res, _matched){
        var resItem = new ResponseItem(_res, _matched);
        if(!_matched || !_matched.files.length){
            ProcessRequest.process(_req, resItem);
            return;
        }
        switch (_matched.meta.type){
            case 'Host':
                _req._parsedUrl.hostname = _matched.files[0];
                ProcessRequest.process(_req, resItem);
                break;
            case 'Combo':
                ProcessCombo.process(_req, resItem, _matched.files);
                break;
            default:
                var str = _matched.files[0];
                if(regHttp.test(str)){
                    ProcessRequest.processAnotherUrl(_req, resItem, str);
                }else{
                    ProcessReplace.process(_req, resItem, str);
                }
                break;
        }
    })


};
