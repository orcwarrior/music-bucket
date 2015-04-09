/**
 * Created by orcwarrior on 2015-01-17.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlistEntryDBFactory', function (songDBFactory, localEntry, youtubeEntry, songzaStationEntry, entryCommons) {

      var localEntry_fromDBModel = function (db) {
        var locEntry = new localEntry(db.entries[0]);
        // locEntry.entries = db.entries;
        locEntry.id = db.id;
        return locEntry;
      }
      var songzaStation_fromDBModel = function (db) {
        var songzaStat = new songzaStationEntry();

        songzaStat.id = db.id;
        songzaStat.station = db.station;
        songzaStat.songsCount = db.songsCount;
        songzaStat.shortDescription = db.shortDescription;

        // If it's based on old save model, update infos:
        if (_.isUndefined(songzaStat.station))
          songzaStat.init(db.id); // grab proper station infos.
        return songzaStat;
      }
      var youtubeEntry_fromDBModel = function (cookie) {
        return new youtubeEntry(cookie.url);
      };
      var localEntry_toDBModel = function (localEntr) {
        return {
          songsCount: localEntr.songsCount,
          entries: _.map(localEntr.entries, function (song) { return songDBFactory.convertTo(song); }),
          id: localEntr.id,
          shortDescription: localEntr.shortDescription,
          type: localEntr.type
        };
      }
      var songzaStation_toDBModel = function (songzaStat) {
        return {
          songsCount: songzaStat.songsCount,
          entries: _.map(songzaStat.entries, function (song) { return songDBFactory.convertTo(song); }),
          id: songzaStat.id,
          shortDescription: songzaStat.shortDescription,
          type: songzaStat.type,
          station: {name: songzaStat.station.name}
        };
      }
      var youtubeEntry_toDBModel = function (youtube) {
        return {
          url: youtube.url, // nothing else is needed :)
          type: youtube.type
        };
      };

      return {
        convertFrom: function (dbModel) {
          switch (dbModel.type) {
            case (entryCommons.entryType.local):
            case (2): // backward compatibility
              return new localEntry_fromDBModel(dbModel);
              break;
            case (entryCommons.entryType.songza):
            case (1):
              return new songzaStation_fromDBModel(dbModel);
              break;
            case (entryCommons.entryType.youtubePlaylist):
            case (entryCommons.entryType.youtubeVideo):
              return new youtubeEntry_fromDBModel(dbModel);
              break;
          }
        },
        convertTo: function (playlistEntry) {
          switch (playlistEntry.type) {
            case (entryCommons.entryType.local
            ):
              return new localEntry_toDBModel(playlistEntry);
            case (entryCommons.entryType.songza
            ):
              return new songzaStation_toDBModel(playlistEntry);
            case (entryCommons.entryType.youtubeVideo) :
            case (entryCommons.entryType.youtubePlaylist) :
              return new youtubeEntry_toDBModel(playlistEntry);
              break;
          }
        }
      };
    });
})();
