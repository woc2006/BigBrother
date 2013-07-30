var connect = require('connect');
var proxy = require('./proxy/index');

var app = connect();

//app.use(connect.logger('dev'));
app.use(proxy.process);

app.listen(3000);