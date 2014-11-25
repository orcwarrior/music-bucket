/**
 * Created by orcwarrior on 2014-11-11.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songLocal', function (songCommons, song) {
               return {
                 constructor: function (file) {
                   var fileUrl = URL.createObjectURL(file);
                   var shared = {
                     id : songCommons.generateGUID(),
                     url   : fileUrl,
                     artist: '',
                     title : file.name.substr(0,file.name.lastIndexOf('.')),
                     album : '',
                     genere: '',
                     type : file.type// mime type
                   };
                   return new song.constructor({file : file, blob : fileUrl}, songCommons.songType.local, shared);
                 }
               }
             });
})();

