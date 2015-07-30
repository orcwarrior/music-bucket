/**
 * Created by orcwarrior on 2014-12-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('localEntry', function ($rootScope, $q, entryCommons) {

      function s4() {
        return Math.floor((1 + Math.random()
        ) * 0x10000)
          .toString(16)
          .substring(1);
      }

      function commonInit(self) {
        self.type = entryCommons.entryType.local;
        self.songsCount = 1;
        self.playedCount = 0;
        self.id = "LFE-" + (function generateGUID() {
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        })();

        self.getNext = function (options) {
          var deferred = $q.defer();
          // TODO: Move to player (on-play, store reference to currenty playlist-entry)
          this.playedCount++;
          deferred.resolve(this.entries[0]);
          if (_.isFunction(options.playlistCallback))
            options.playlistCallback(this.entries[0]);
          return deferred.promise;
        };
        self.updateShortDescription = function () {
          this.shortDescription = this.entries[0].metainfos.artist + " - " + this.entries[0].metainfos.title;
        };
        self.getPlaylistDescription = function () {
          self.updateShortDescription();
          return this.shortDescription;
        };
      } // commonInit

      return function localEntry(localSong) {
        var self = this;
        commonInit(this);
        if (_.isUndefined(localSong)) return;

        this.entries = [localSong];
        // Temporary, pre warm-up name:
        this.shortDescription = this.entries[0].metainfos.title;

        localSong.entryId = this.id;
      };
    });
})();
