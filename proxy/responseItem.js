var additional = require('./rule').additionRule;

function ResponseItem(res, matched){
    this.res = res;
    this.matched = matched;
}

ResponseItem.methods({
    setHeader: function(key, value){
        this.res.setHeader(key, value);
    },

    writeHead: function(status, header){
        this.res.writeHead(status, header);
    },

    setStatus: function(status){
        this.res.statusCode = status;
    },

    end: function(content){
        if(this.matched && (this.matched.additional & additional.crossDomain)>0){
            //override
            this.setHeader('Access-Control-Allow-Origin','*');
            this.setHeader('Access-Control-Allow-Credentials','true');
        }
        this.res.write(content);
        this.res.end();
    }
});

exports.ResponseItem = ResponseItem;