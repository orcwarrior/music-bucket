/**
 * Created by orcwarrior on 2015-01-03.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songYoutube', function (songCommons, song) {
               return {
                 constructorFromLocal: function (ytSearchItem, baseEntry) {

                   var shared = {
                     id : ytSearchItem.id.videoId,
                     url   : "http://www.youtube.com/embed/"+ytSearchItem.id.videoId,
                     artist: '',
                     title : '',
                     album : '',
                     genere: '',
                     type  : '', // mime type
                     requestUrl : undefined
                   };

                   if (!_.isUndefined(baseEntry))
                   {
                     shared.artist = baseEntry.shared.artist;
                     shared.title = baseEntry.shared.title;
                     shared.album = baseEntry.shared.album;
                     shared.genere = baseEntry.shared.genere;
                   }
                   return new song.constructor({ytData: ytSearchItem}, songCommons.songType.youtube, shared);
                 },
                 constructor : function (youtubeId) {
                   var shared = {
                     id : youtubeId,
                     url   : "http://www.youtube.com/embed/" + youtubeId,
                     artist: '',
                     title : '',
                     album : '',
                     genere: '',
                     type  : '' // mime type
                   };
                   return new song.constructor({id: youtubeId}, songCommons.songType.youtube, shared);
                 }
               }
             });
})();

