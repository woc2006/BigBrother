var additional = require('./rule').additionRule;

function ResponseItem(res, matched){
    this.res = res;
    this.matched = matched;
}

ResponseItem.methods({
    setHeader: function(key, value){
        this.res.setHeader(key, value);
    },

    writeHead: function(status, headers){
        this.setStatus(status);
        for(var key in headers){
            this.setHeader(key, headers[key]);
        }
        //this.res.writeHead(status, header);
    },

    setStatus: function(status){
        this.res.statusCode = status;
    },

    end: function(content){
        var meta = null, res = this.res;
        if(this.matched){
            meta = this.matched.meta;
        }
        if(meta && (meta.additional & additional.crossDomain)>0){
            //override
            this.setHeader('Access-Control-Allow-Origin','*');
            this.setHeader('Access-Control-Allow-Credentials','true');
        }
        if(!content){
            res.end();
            return;
        }
        if(meta && meta.speed){
            var index = 0,
                len = content.length;

            var send = function(){
                var end = Math.floor(index + meta.speed * 256);
                if(end > len){
                    end = len;
                }
                res.write(content.slice(index, end));
                index = end;
                if(index < len){
                    setTimeout(send, 250);
                }else{
                    res.end();
                }
            }
            send();
        }else{
            res.end(content);
        }
    }
});

exports.ResponseItem = ResponseItem;