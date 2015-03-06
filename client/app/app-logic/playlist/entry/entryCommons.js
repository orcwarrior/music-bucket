/**
 * Created by orcwarrior on 2014-12-26.
 */


(function () {
  angular.module('musicBucketEngine')
    .factory('entryCommons', function () {

               return {
                 entryType    : {localEntry: 0, songzaStation: 1 /*...*/},
                 getPlaylistDescription : function () {
                   return this.shortDescription;
                 }
               }
             });
}
)();
