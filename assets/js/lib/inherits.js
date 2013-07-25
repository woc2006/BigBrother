/**
 * Inherits method
 * http://javascript.crockford.com/inheritance.html
 * @param parent
 * @return {*}
 */
Function.prototype.inherits = function (parent) {
    this.prototype = new parent();
    var callStack = {},
        methods = this.prototype;
    this.prototype.constructor = parent;
    this.prototype.base = function(name) {
        if (!(name in callStack)) {
            callStack[name] = 0;
        }
        var func, result, callDepth = callStack[name], parentMethods = parent.prototype;
        if (callDepth) {
            while (callDepth) {
                parentMethods = parentMethods.constructor.prototype;
                callDepth -= 1;
            }
            func = parentMethods[name];
        } else {
            func = methods[name];
            if (func == this[name]) {
                func = parentMethods[name];
            }
        }
        callStack[name] += 1;
        result = func.apply(this, Array.prototype.slice.apply(arguments, [1]));
        callStack[name] -= 1;
        return result;
    };
    return this;
};

Function.prototype.methods = function(methods){
    for(var key in methods){
        this.prototype[key] = methods[key];
    }
};