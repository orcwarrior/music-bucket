/**
 * Created by orcwarrior on 2014-11-08.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('song', function () {
               return {
                 constructor : function(base, baseType, shared) {
                   this.base = base;
                   this.baseType = baseType;
                   this.shared = shared;
                 }
               };
             });
})();
