/**
 * parse position of translate3d
 * @param el
 */
exports.getElementPosition3d = function(el){
    var raw = el.css('webkitTransform');
    var match = /\d+/g.match(raw);
   if(match && match.length == 6){
       return {
           x: parseInt(match[4]) || 0,
           y: parseInt(match[5]) || 0
       };
   }else{
       return {x:0,y:0};
   }
};

exports.getElementPosition = function(el){
    var raw = el.css('webkitTransform');
    var match = /\d+/g.match(raw);
    if(match && match.length == 6){
        return {
            x: parseInt(match[4]) || 0,
            y: parseInt(match[5]) || 0
        };
    }else{
        return {x:0,y:0};
    }
}