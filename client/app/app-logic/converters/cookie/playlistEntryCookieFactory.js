/**
 * Created by orcwarrior on 2015-01-17.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlistEntryCookieFactory', function (songCookieFactory, localEntry, songzaStationEntry, youtubeEntryBuilder, soundcloudEntry, entryCommons) {

      var localEntry_fromCookieModel = function (cookie) {
        var locEntry = new localEntry();
        locEntry.entries = _.map(cookie.entries, function (song) { return songCookieFactory.convertFrom(song); });
        locEntry.id = cookie.id;
        locEntry.songsCount = cookie.songsCount;
        locEntry.playedCount = cookie.playedCount;
        locEntry.type = cookie.type;
        return locEntry;
      }
      var songzaStation_fromCookieModel = function (cookie) {
        var songzaStat = new songzaStationEntry();

        songzaStat.id = cookie.id;
        songzaStat.station = cookie.station;
        songzaStat.songsCount = cookie.songsCount;
        songzaStat.shortDescription = cookie.shortDescription;
        songzaStat.station = cookie.station;
        songzaStat.songsCount = cookie.songsCount;
        songzaStat.stationName = cookie.stationName;
        songzaStat.type = cookie.type;
        songzaStat.playedIDs = cookie.playedIDs;
        // Computed:
        songzaStat.playedCount = cookie.playedIDs.length;
        songzaStat.updateShortDescription();

        // If it's based on old save model, update infos:
        if (_.isUndefined(songzaStat.station))
          songzaStat.init(cookie.id); // grab proper station infos.
        return songzaStat;
      };
      var youtubeEntryBuilder_fromCookieModel = function (cookie) {
        var entry = new youtubeEntryBuilder(cookie.url);
        entry.playedCount = cookie.playedCount;
        entry.playedIDs = cookie.playedIDs;
        return entry;
      };
      var soundcloudEntry_fromCookieModel = function (cookie) {
        var entry = new soundcloudEntry(cookie.scObj);
        entry.playedCount = cookie.playedCount;
        entry.playedIDs = cookie.playedIDs;
        return entry;
      }

      /// Convert To
      var localEntry_toCookieModel = function (localEntr) {
        return {
          id: localEntr.id,
          songsCount: localEntr.songsCount,
          playedCount: localEntr.playedCount,
          entries: _.map(localEntr.entries, function (song) { return songCookieFactory.convertTo(song); }),
          shortDescription: localEntr.shortDescription,
          type: localEntr.type
        };
      }
      var songzaStation_toCookieModel = function (songzaStat) {
        return {
          id: songzaStat.id,
          station: songzaStat.station,
          songsCount: songzaStat.songsCount,
          shortDescription: songzaStat.shortDescription,
          stationName: songzaStat.stationName,
          type: songzaStat.type,
          playedIDs: songzaStat.playedIDs,
          entries: _.map(songzaStat.entries, function (song) { return songCookieFactory.convertTo(song); })

        };
      };
      var youtubeEntryBuilder_toCookieModel = function (youtube) {
        return {
          url: youtube.url, // nothing else is needed :)
          type: youtube.type,
          playedCount: youtube.playedCount,
          playedIDs: youtube.playedIDs
        };
      };
      var soundcloudEntry_toCookieModel = function (soundcloud) {
        return {
          scObj: {
            id: soundcloud._scObj.id,
            title: soundcloud._scObj.title,
            genere: soundcloud._scObj.genre,
            artwork_url: soundcloud._scObj.artwork_url,
            user: {username: soundcloud._scObj.user.username}
          },
          playedCount: soundcloud.playedCount,
          playedIDs: soundcloud.playedIDs,
          type: entryCommons.entryType.soundcloudTrack
        };
      }

      return {
        convertFrom: function (cookieModel) {
          if (cookieModel == null) {
            console.warn("Coockie model is null, probably stored no handled entry type!");
            return undefined;
          }
          switch (cookieModel.type) {
            case (entryCommons.entryType.local
            ):
              return new localEntry_fromCookieModel(cookieModel);
            case (entryCommons.entryType.songza
            ):
              return new songzaStation_fromCookieModel(cookieModel);
            case (entryCommons.entryType.youtubeVideo) :
              return new youtubeEntryBuilder_fromCookieModel(cookieModel);
            case (entryCommons.entryType.youtubePlaylist) :
              return new youtubeEntryBuilder_fromCookieModel(cookieModel);
            case (entryCommons.entryType.soundcloudTrack) :
              return new soundcloudEntry_fromCookieModel(cookieModel);
          }
        },
        convertTo: function (playlistEntry) {
          switch (playlistEntry.type) {
            case (entryCommons.entryType.local
            ):
              return new localEntry_toCookieModel(playlistEntry);
            case (entryCommons.entryType.songza
            ):
              return new songzaStation_toCookieModel(playlistEntry);
            case (entryCommons.entryType.youtubeVideo) :
              return new youtubeEntryBuilder_toCookieModel(playlistEntry);
            case (entryCommons.entryType.youtubePlaylist) :
              return new youtubeEntryBuilder_toCookieModel(playlistEntry);
            case (entryCommons.entryType.soundcloudTrack) :
              return new soundcloudEntry_toCookieModel(playlistEntry);
          }
        }
      };
    });
})();
