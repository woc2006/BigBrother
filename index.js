var proxy = require('./proxy/index');
var http = require('http');

var serverHttp = http.createServer(function(req, res){
    proxy.process(req, res);
}).listen(3000);

