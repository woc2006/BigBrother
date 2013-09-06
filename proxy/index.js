var Url = require('url');
var Rules = require('./rule');
var ProcessRequest = require('./route/request');
var ProcessReplace = require('./route/replace');
var ProcessCombo = require('./route/combo');
var ResponseItem = require('./responseItem').ResponseItem;
var RequestItem = require('./requestItem').RequestItem;

var regHttp = /^http/;

exports.process = function(req, res){
    var _parsedUrl = Url.parse(req.url);
    //url fix
    _parsedUrl.hostname = _parsedUrl.hostname || '127.0.0.1';
    _parsedUrl.path = _parsedUrl.path || '/';
    _parsedUrl.pathname = _parsedUrl.pathname || '/';
    _parsedUrl.protocol = _parsedUrl.protocol || 'http:';
    _parsedUrl.port = _parsedUrl.port || 80;

    if(_parsedUrl.search && _parsedUrl.search.indexOf("??") == 0){
        //special url like http://host/path??a.js,b.js
        var arr = _parsedUrl.search.split("?");
        if(arr.length >= 3){
            _parsedUrl.pathname += '??' + arr[2];
            arr.splice(0,3);
            if(arr.length){
                var realSearch = arr.join('?');
                _parsedUrl.search = '?' + realSearch;
                _parsedUrl.query = realSearch;
            }else{
                _parsedUrl.search = null;
                _parsedUrl.query = null;
            }
        }
    }
    req._parsedUrl = _parsedUrl;
    var url = req.url;

    var reqItem = new RequestItem(req, res, function(_req, _res){
        var matched = Rules.matchRule(_req);
        var resItem = new ResponseItem(_res, matched);
        if(!matched || !matched.files.length || !matched.files[0]){
            ProcessRequest.process(_req, resItem);
            return;
        }
        switch (matched.meta.type){
            case 'Host':
                _req._parsedUrl.realhost = _req._parsedUrl.hostname;
                _req._parsedUrl.hostname = matched.files[0];
                _req._parsedUrl.port = parseInt(matched.files[1] || 80);
                ProcessRequest.process(_req, resItem);
                break;
            case 'Status':
                ProcessRequest.processDefaultReturn(_req, resItem, parseInt(matched.files[0]) || 404);
                break;
            case 'Combo':
                ProcessCombo.process(_req, resItem, matched.files, matched.remote);
                break;
            default:
                var str = matched.files[0];
                if(regHttp.test(str)){
                    ProcessRequest.processAnotherUrl(_req, resItem, str);
                }else{
                    ProcessReplace.process(_req, resItem, str);
                }
                break;
        }
    })


};
