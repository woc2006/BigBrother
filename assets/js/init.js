var inherits = require('./lib/inherits'); //require to run inherits code.
var pageControl = require('./pageControl');
var session = require('./sessions');

exports.init = function(){
    pageControl.init();
    session.addSession();
}
