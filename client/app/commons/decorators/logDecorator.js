/**
 * Created by orcwarrior on 2015-02-03.
 */
angular.module('musicBucketApp')
  .config(function ($provide) {
            function getCurrentTime(msg) {
              var date = new Date();
              var time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
              return time;
            };
            function getSrcFileAndLine() {
              var err = new Error();
              if (_.isUndefined(err.stack)) return "";

              return new Error().stack.split("\n")[3];
            }

            $provide.decorator('$log', function ($delegate) {
              /*
               * LOG
               */
              var origLog = $delegate.log;
              $delegate.log = function () {
                var args = [].slice.call(arguments);
                console.groupCollapsed(getCurrentTime() + ' ' + args[0]);
                origLog.apply(null, args);
                origLog.apply(null, [getSrcFileAndLine()]);
                console.groupEnd();
              };
              /*
               * INFO
               */
              var origInfo = $delegate.info;
              $delegate.info = function () {
                var args = [].slice.call(arguments);
                console.groupCollapsed(getCurrentTime() + ' ' + args[0]);
                origInfo.apply(null, args);
                origInfo.apply(null, [getSrcFileAndLine()]);
                console.groupEnd();
              };
              /*
               * WARN
               */
              var origWarn = $delegate.warn;
              $delegate.warn = function () {
                var args = [].slice.call(arguments);
                console.groupCollapsed(getCurrentTime() + ' ' + args[0]);
                origWarn.apply(null, args);
                origWarn.apply(null, [getSrcFileAndLine()]);
                console.groupEnd();
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
                console.groupCollapsed(getCurrentTime() + ' ' + args[0]);
                origDebug.apply(null, args);
                origDebug.apply(null, [getSrcFileAndLine()]);
                console.groupEnd();
              };

              return $delegate;
            });
          })
