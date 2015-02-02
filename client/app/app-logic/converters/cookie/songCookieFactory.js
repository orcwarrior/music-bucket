/**
 * Created by orcwarrior on 2015-01-17.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songCookieFactory', function ( entryDBHelper, localEntry, songzaStation) {

               var songLocal_fromCookieModel = function (db) {
               }
               var songSongza_fromCookieModel = function (db) {
               }


               return {
                 convertFrom: function (songCookie) {
                   var song = {
                     shared  : {
                       id : songCookie.shared.id,
                       url : songCookie.shared.url,
                       artist: songCookie.shared.artist,
                       title : songCookie.shared.title,
                       album : songCookie.shared.album,
                       genere: songCookie.shared.genere,
                       albumArt : songCookie.shared.albumArt
                     },
                     baseType: songCookie.baseType,
                     base    : _.clone(songCookie.base)
                   };
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
