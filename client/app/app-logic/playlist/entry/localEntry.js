/**
 * Created by orcwarrior on 2014-12-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('localEntry', function ($rootScope, $q, entryCommons) {
      function commonInit(self) {
        self.type = entryCommons.entryType.localEntry;
        self.songsCount = 1;
        self.playedCount = 0;

        self.init = function () {
        }
        self.getNext = function (playlistCallback) {
          var deferred = $q.defer();
          // TODO: Move to player (on-play, store reference to currenty playlist-entry)
          this.playedCount++;
          deferred.resolve(this.entries[0]);
          playlistCallback(this.entries[0]);
          return deferred.promise;
        };
        self.updateShortDescription = function () {
          this.shortDescription = this.entries[0].metainfos.artist + " - " + this.entries[0].metainfos.title;
        };
        self.getPlaylistDescription = function () {
          self.updateShortDescription();
          return this.shortDescription;
        }
      } // commonInit

      return function localEntry(localSong) {
        var self = this;
        commonInit(this);
        if (_.isUndefined(localSong)) return;

        this.entries = [localSong];
        this.id = this.entries[0].metainfos.id;
        // Temporary, pre warm-up name:
        this.shortDescription = this.entries[0].metainfos.title;
        this.init();
      };
    });
})();
