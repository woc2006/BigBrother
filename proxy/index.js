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

    var matched = Rules.matchRule(url);
    var reqItem = new RequestItem(req, res, matched, function(_req, _res, _matched){
        var resItem = new ResponseItem(_res, _matched);
        if(!_matched || !_matched.files.length || !_matched.files[0]){
            ProcessRequest.process(_req, resItem);
            return;
        }
        switch (_matched.meta.type){
            case 'Host':
                _req._parsedUrl.hostname = _matched.files[0];
                _req._parsedUrl.port = parseInt(_matched.files[1] || 80);
                ProcessRequest.process(_req, resItem);
                break;
            case 'Combo':
                ProcessCombo.process(_req, resItem, _matched.files, _matched.remote);
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
