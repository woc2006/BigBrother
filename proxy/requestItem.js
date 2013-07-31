function RequestItem(req, res, matched, callback){
    this.req = req;
    this.res = res;
    this.matched = matched;
    this.callback = callback;
    this.run();
}

RequestItem.methods({
    run: function(){
        this.callback(this.req, this.res, this.matched);
    }
});

exports.RequestItem = RequestItem;