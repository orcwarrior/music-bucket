/**
 * Created by orcwa on 15.11.2015.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songzaEntryBuilder', function ($q, $injector, songzaApi, entryCommons, virtualEntry, songMetainfos, songUnresolved, entryBuilder) {
      function _hasFullSongzaInfos(songzaInfos) {
        return !_.isUndefined(songzaInfos.songs) && songzaInfos.songs.length && _.isObject(songzaInfos.songs[0]);
      }

      function _fetchFullSongzaInfos(songzaInfos) {
        if (_.isObject(songzaInfos)) {
          return songzaApi.station.get(songzaInfos._id);
        } else {
          return songzaApi.station.get(songzaInfos);
        }
      }

      function buildBasedOnStation(songzaStation, restoredObj) {
        var songzaEntry = new virtualEntry(songzaStation.name, undefined, entryCommons.nextOrder.random);
        _.each(songzaStation.songs, function (song) {
          songzaEntry.addSong(new songUnresolved(
            new songMetainfos({
              artist: song.artist,
              album: song.album,
              title: song.title,
              duration: song.duration //in sec
              //albumArt: song.albumArt,
              //trackNo: song.trackNo
            })
            /*,resolveFunction (use default)*/
          ));
        });
        if (restoredObj)
          _.deepExtend(songzaEntry, restoredObj);
        // setup builder, for data store id only
        songzaEntry.__builder__ = {name: 'songzaEntryBuilder', data: songzaStation._id};
        return songzaEntry;
      }

      var songzaEntryBuilderFunc = function songzaEntryBuilder() {
        this.build = function (songzaInfos, restoredObj) {
          var deffered = $q.defer();
          if (_hasFullSongzaInfos(songzaInfos))
            deffered.resolve(buildBasedOnStation(songzaInfos, restoredObj));
          else {
            _fetchFullSongzaInfos(songzaInfos, restoredObj)
              .then(function (res) {
                deffered.resolve(buildBasedOnStation(res.data, restoredObj));
              });
          }
          return deffered.promise;
        };
      };
      songzaEntryBuilderFunc.prototype = entryBuilder;

      return new songzaEntryBuilderFunc();
    });
})();
