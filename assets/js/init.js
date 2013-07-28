var inherits = require('./lib/inherits'); //require to run inherits code.
var pageControl = require('./pageControl');
var ConfigFilter = require('../../proxy/config');
var ConfigRule = require('../../proxy/rule');

exports.init = function(){
    ConfigFilter.init();
    ConfigRule.init();
    pageControl.init();
}
