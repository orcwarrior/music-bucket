/**
 * Created by orcwarrior on 2014-11-08.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songSongza', function (songCommons, song) {
                 return {
                   constructor: function (src) {
                     src.id = src.song.id;
                     var shared = {
                       id : src.song.id,
                       url   : src.listen_url,
                       artist: src.song.artist.name,
                       title : src.song.title,
                       album : src.song.album,
                       albumArt : src.song.cover_url.replace('a.jpeg', 'g.jpeg'),
                       genere: src.song.genre,
                     };
                     return new song.constructor(src, songCommons.songType.songza, shared);
                   }
                 }
             });
})();

