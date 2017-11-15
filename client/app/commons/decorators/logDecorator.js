/**
 * Created by orcwarrior on 2015-02-03.
 */
angular.module('musicBucketApp')
  .config(function ($provide) {
    function getCurrentTime(msg) {
      var date = new Date();
      var min = date.getMinutes();
      if (min.length === 1) min = "0" + min;
      var time = date.getHours() + ':' + min + ':' + date.getSeconds();
      return time;
    };
    function getSrcFileAndLine() {
      var err = new Error();
      if (_.isUndefined(err.stack)) return "";

      return new Error().stack.split("\n")[4];
    }
    function buildOutputMsg(logArgs) {
      if (_.isObject(logArgs[0]))
        return logArgs;
      else {
        if (logArgs[0]) logArgs[0] = getCurrentTime() + ' ' + logArgs[0] + getSrcFileAndLine()
        return logArgs;
      }
    }

    $provide.decorator('$log', function ($delegate) {
      /*
       * LOG
       */
      var origLog = $delegate.log;
      $delegate.log = function () {
        var args = [].slice.call(arguments);
        // console.groupCollapsed(getCurrentTime() + ' ' + args[0]);
        // origLog.apply(null, args);
        // origLog.apply(null, [getSrcFileAndLine()]);
        // console.groupEnd();
        origLog.apply(null, buildOutputMsg(args));
      };
      /*
       * INFO
       */
      var origInfo = $delegate.info;
      $delegate.info = function () {
        var args = [].slice.call(arguments);
        // console.groupCollapsed(getCurrentTime() + ' ' + args[0]);
        origInfo.apply(null, buildOutputMsg(args));
        // origInfo.apply(null, [getSrcFileAndLine()]);
        // console.groupEnd();
      };
      /*
       * WARN
       */
      var origWarn = $delegate.warn;
      $delegate.warn = function () {
        var args = [].slice.call(arguments);
        //console.groupCollapsed(getCurrentTime() + ' ' + args[0]);
        //origWarn.apply(null, args);
        //origWarn.apply(null, [getSrcFileAndLine()]);
        origWarn.apply(null, buildOutputMsg(args));
        //console.groupEnd();
      };
      /*
       * ERROR
       */
      // I'm good with error
      // var origError = $delegate.error;
      // $delegate.error = function () {
      //   var args = [].slice.call(arguments);
      //   console.groupCollapsed(getCurrentTime() + ' ' + args[0]);
      //   origError.apply(null, args);
      //   origError.apply(null, [getSrcFileAndLine()]);
      //   console.groupEnd();
      // };
      /*
       * DEBUG
       */
      var origDebug = $delegate.debug;
      $delegate.debug = function () {
        var args = [].slice.call(arguments);
        // console.groupCollapsed(getCurrentTime() + ' ' + args[0]);
        // origDebug.apply(null, args);
        // origDebug.apply(null, [getSrcFileAndLine()]);
        // console.groupEnd();
        origDebug.apply(null, buildOutputMsg(args));
      };

      return $delegate;
    });
  })
