var inherits = require('./lib/inherits'); //require to run inherits code.
var pageControl = require('./pageControl');
var ConfigFilter = require('../../proxy/config');
var ConfigRule = require('../../proxy/rule');
var ConfigTip = require('./tipsControl');
var keyControl = require('./keyControl');

exports.init = function(){
    ConfigFilter.init();
    ConfigRule.init();
    ConfigTip.init();
    pageControl.init();
    keyControl.init();
}
