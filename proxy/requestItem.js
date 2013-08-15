var qs = require('qs');

function RequestItem(req, res, matched, callback){
    this.req = req;
    this.res = res;
    this.matched = matched;
    this.callback = callback;
    this.run();
}

RequestItem.methods({
    run: function(){
        //parse get query
        var req = this.req;
        if(req._parsedUrl.query){
            try{
                req.paramQuery = qs.parse(req._parsedUrl.query);
                delete req.paramQuery.__proto__;
            }catch(e){
                req.paramQuery = null;
            }
        }
        if(this.req.method == 'POST'){
            var buffer = [],
                self = this;
            this.req.setEncoding('utf8');

            this.req.on('data',function(chunk){
                buffer.push(chunk);
            });

            this.req.on('end',function(chunk){
                req.removeAllListeners('data');
                req.removeAllListeners('end');
                req.postData = buffer.join('');//Buffer.concat(buffer);
                //parse post query
                try{
                    req.paramPost = qs.parse(req.postData);
                    delete req.paramPost.__proto__;
                }catch(e){
                    req.paramPost = null;
                }
                self.callback(req, self.res, self.matched);
            });
        }else{
            this.callback(this.req, this.res, this.matched);
        }
    }
});

exports.RequestItem = RequestItem;