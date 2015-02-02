/**
 * Created by orcwarrior on 2015-01-17.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlistEntryCookieFactory', function (songCookieFactory, localEntry, songzaStation, entryCommons) {

               var localEntry_fromCookieModel = function (cookie) {
                 var locEntry = new localEntry.constructor_();
                 locEntry.entries     = cookie.entries;
                 locEntry.id          = cookie.id;
                 locEntry.songsCount  = cookie.songsCount;
                 locEntry.playedCount = cookie.playedCount;
                 locEntry.type        = cookie.type;
                 return locEntry;
               }
               var songzaStation_fromCookieModel = function (cookie) {
                 var songzaStat = new songzaStation.constructor_();

                 songzaStat.id                   = cookie.id;
                 songzaStat.station              = cookie.station;
                 songzaStat.songsCount           = cookie.songsCount;
                 songzaStat.shortDescription     = cookie.shortDescription;
                 songzaStat.station              = cookie.station;
                 songzaStat.songsCount           = cookie.songsCount;
                 songzaStat.stationName          = cookie.stationName;
                 songzaStat.type                 = cookie.type;
                 songzaStat.playedIDs            = cookie.playedIDs;
                 // Computed:
                 songzaStat.playedCount          = cookie.playedIDs.length;
                 songzaStat.updateShortDescription();

                 // If it's based on old save model, update infos:
                 if (_.isUndefined(songzaStat.station))
                  songzaStat.init(cookie.id); // grab proper station infos.
                 return songzaStat;
               }
               var localEntry_toCookieModel = function (localEntr) {
                 return {
                   id              : localEntr.id,
                   songsCount    : localEntr.songsCount,
                   playedCount     : localEntr.playedCount,
                   entries         : _.map(localEntr.entries, function(song) { return songCookieFactory.convertTo(song); }),
                   shortDescription: localEntr.shortDescription,
                   type            : localEntr.type
                 };
               }
                 var songzaStation_toCookieModel = function (songzaStat) {
                   return {
                     id                   : songzaStat.id,
                     station              : songzaStat.station,
                     songsCount           : songzaStat.songsCount,
                     shortDescription     : songzaStat.shortDescription,
                     station              : songzaStat.station,
                     songsCount           : songzaStat.songsCount,
                     stationName          : songzaStat.stationName,
                     type                 : songzaStat.type,
                     playedIDs            : songzaStat.playedIDs,
                     entries              : _.map(songzaStat.entries, function(song) { return songCookieFactory.convertTo(song); })

                   };
                 }

               return {
                 convertFrom: function (cookieModel) {
                   switch (cookieModel.type) {
                     case (entryCommons.entryType.localEntry
                     ):
                       return new localEntry_fromCookieModel(cookieModel);
                     case (entryCommons.entryType.songzaStation
                     ):
                       return new songzaStation_fromCookieModel(cookieModel);
                   }
                 },
                 convertTo: function (playlistEntry) {
                   switch (playlistEntry.type) {
                     case (entryCommons.entryType.localEntry
                     ):
                       return new localEntry_toCookieModel(playlistEntry);
                     case (entryCommons.entryType.songzaStation
                     ):
                       return new songzaStation_toCookieModel(playlistEntry);
                   }
                 }
               };
             });
}
)();
