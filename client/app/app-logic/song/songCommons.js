/**
 * Created by orcwarrior on 2014-11-08.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songCommons', function () {
                 var guid = (function() {
                   function s4() {
                     return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
                   }
                 })();
               return {
                 songType: {songza: 0, local: 1, spotify: 2},
                 generateGUID : function() {
                   return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                     s4() + '-' + s4() + s4() + s4();
                 }

               };
             });
})();
