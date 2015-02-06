/**
 * Created by orcwarrior on 2015-01-17.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songCookieFactory', function (song, localEntry, songzaStation) {

               var songLocal_fromCookieModel = function (db) {
               }
               var songSongza_fromCookieModel = function (db) {
               }


               return {
                 convertFrom: function (songCookie) {
                   var sharedCookie  = {
                     id : songCookie.shared.id,
                       url : songCookie.shared.url,
                       artist: songCookie.shared.artist,
                       title : songCookie.shared.title,
                       album : songCookie.shared.album,
                       genere: songCookie.shared.genere,
                       albumArt : songCookie.shared.albumArt
                   };
                   var result = new song.constructor(songCookie.base, songCookie.baseType, sharedCookie);
                   return result;
                 },
                 convertTo  : function (song) {
                   var songDB = {
                     shared  : {
                       id : song.shared.id,
                       url : song.shared.url,
                       artist: song.shared.artist,
                       title : song.shared.title,
                       album : song.shared.album,
                       genere: song.shared.genere
                     },
                     baseType: song.baseType,
                     base    : _.clone(song.base)
                   };

                   // Copy album art only if it's an URL.
                   if (!song.shared.albumArtAttached) {
                     songDB.shared.albumArt = song.shared.albumArt;
                   }
                   return songDB;
                 }
               }
             });
      })();
