/**
 * Created by orcwarrior on 2015-04-05.
 */
/***************************************************************
 *
 *   Observable
 * based on:
 * http://stackoverflow.com/a/9672223
 ***************************************************************/
var observable;
(observable = function() {
}).prototype = {
  listen: function(type, method, scope, context) {
    var listeners, handlers;
    if (!(listeners = this.listeners)) {
      listeners = this.listeners = {};
    }
    if (!(handlers = listeners[type])){
      handlers = listeners[type] = [];
    }
    scope = (scope ? scope : window);
    handlers.push({
      method: method,
      scope: scope,
      context: (context ? context : scope)
    });
  },
  fireEvent: function(type, data, context) {
    var listeners, handlers, i, n, handler, scope;
    if (!(listeners = this.listeners)) {
      return;
    }
    if (!(handlers = listeners[type])){
      return;
    }
    for (i = 0, n = handlers.length; i < n; i++){
      handler = handlers[i];
      if (typeof(context)!=="undefined" && context !== handler.context) continue;
      if (handler.method.call(
          handler.scope, this, type, data
        )===false) {
        return false;
      }
    }
    return true;
  }
};
