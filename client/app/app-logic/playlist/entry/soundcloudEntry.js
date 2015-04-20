/**
 * Created by orcwarrior on 2015-03-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('soundcloudEntry', function (entryCommons, song, songCommons, $q) {


      return function soundcloudEntry(soundcloudTrackObj) {
        var self = this;
        this.id = soundcloudTrackObj.id;
        this.type = entryCommons.entryType.soundcloudTrack;
        this.songsCount = 1;
        this.playedIDs = [];
        this.playedCount = 0;

        this.entries = [new song(soundcloudTrackObj, songCommons.songType.soundcloud, this.id)];

        this.getPlaylistDescription = function () {
          return this.entries[0].metainfos.getSongDescription();
        };
        this.getNext = function (playlistCb) {
          var scPromise = $q.defer();
          var selectedEntry = this.entries[0];
          scPromise.resolve(selectedEntry);
          if (_.isFunction(playlistCb))
            playlistCb(selectedEntry);
          return scPromise.promise;
        };
      }
    }
  )
  ;
})();
