/**
 * Created by orcwarrior on 2014-11-08.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songCommons', function () {
               var guid = (function () {
                 function s4() {
                   return Math.floor((1 + Math.random()
                                     ) * 0x10000)
                     .toString(16)
                     .substring(1);
                 }
               }
               )();
               return {
                 songType    : {songza: "typeSongza", local: "typeLocal", spotify: "typeSpotify", youtube: "typeYoutube"},
                 generateGUID: function () {
                   return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                     s4() + '-' + s4() + s4() + s4();
                 }
               }
  });
})();
