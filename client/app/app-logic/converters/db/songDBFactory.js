/**
 * Created by orcwarrior on 2015-01-17.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songDBFactory', function (playlist, localEntry, songzaStation) {

               var songLocal_fromDBModel = function (db) {
               }
               var songSongza_fromDBModel = function (db) {
               }


               return {
                 convertFrom: function (songDb) {
                   var song = {
                     shared  : {
                       id : songDb.shared.id,
                       url : songDb.shared.url,
                       artist: songDb.shared.artist,
                       title : songDb.shared.title,
                       album : songDb.shared.album,
                       genere: songDb.shared.genere,
                       albumArt : songDb.shared.albumArt
                     },
                     baseType: songDb.baseType,
                     base    : songDb.base
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
                     base    : song.base
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
