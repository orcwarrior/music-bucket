/**
 * Created by orcwarrior on 2015-01-17.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlistEntryDBFactory', function (songDBFactory, localEntry, songzaStation, entryCommons) {

               var localEntry_fromDBModel = function (db) {
                 var locEntry = new localEntry.constructor_();
                 locEntry.entries = db.entries;
                 locEntry.id = db.id;
                 return locEntry;
               }
               var songzaStation_fromDBModel = function (db) {
                 var songzaStat = new song();

                 songzaStat.id = db.id;
                 songzaStat.station = db.station;
                 songzaStat.songsCount = db.songsCount;
                 songzaStat.shortDescription = db.shortDescription;

                 // If it's based on old save model, update infos:
                 if (_.isUndefined(songzaStat.station))
                  songzaStat.init(db.id); // grab proper station infos.
                 return songzaStat;
               }
               var localEntry_toDBModel = function (localEntr) {
                 return {
                   songsCount      : localEntr.songsCount,
                   entries         : _.map(localEntr.entries, function(song) { return songDBFactory.convertTo(song); }),
                   id              : localEntr.id,
                   shortDescription: localEntr.shortDescription,
                   type            : localEntr.type
                 };
               }
                 var songzaStation_toDBModel = function (songzaStat) {
                   return {
                     songsCount      : songzaStat.songsCount,
                     entries         : _.map(songzaStat.entries, function(song) { return songDBFactory.convertTo(song); }),
                     id              : songzaStat.id,
                     shortDescription: songzaStat.shortDescription,
                     type            : songzaStat.type,
                     station         : {name: songzaStat.station.name}
                   };
                 }

               return {
                 convertFrom: function (dbModel) {
                   switch (dbModel.type) {
                     case (entryCommons.entryType.localEntry
                     ):
                       return new localEntry_fromDBModel(dbModel);
                     case (entryCommons.entryType.songzaStation
                     ):
                       return new songzaStation_fromDBModel(dbModel);
                   }
                 },
                 convertTo: function (playlistEntry) {
                   switch (playlistEntry.type) {
                     case (entryCommons.entryType.localEntry
                     ):
                       return new localEntry_toDBModel(playlistEntry);
                     case (entryCommons.entryType.songzaStation
                     ):
                       return new songzaStation_toDBModel(playlistEntry);
                   }
                 }
               };
             });
}
)();
