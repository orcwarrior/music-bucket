/**
 * Created by orcwarrior on 2014-12-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('localEntry', function ($rootScope, $q, entryBase, entryCommons, hashGenerator) {

      var localEntryFunc = function localEntry(localSong) {
        var self = this;
        this.type = entryCommons.entryType.local;
        this.songsCount = 1;
        this.playedCount = 0;
        this.id = "LFE-" + hashGenerator.generateId();

        this.getNext = function (options) {
          var deferred = $q.defer();
          // TODO: Move to player (on-play, store reference to currenty playlist-entry)
          this.playedCount++;
          deferred.resolve(this.entries[0]);
          if (_.isFunction(options.playlistCallback))
            options.playlistCallback(this.entries[0]);
          return deferred.promise;
        };
        this.updateShortDescription = function () {
          this.shortDescription = this.entries[0].metainfos.artist + " - " + this.entries[0].metainfos.title;
        };
        if (_.isUndefined(localSong)) return;

        this.entries = [localSong];
        // Temporary, pre warm-up name:
        this.shortDescription = this.entries[0].metainfos.title;

        localSong.entryId = this.id;
      };
      localEntryFunc.prototype = new entryBase();
      localEntryFunc.__models__ = {
        db: {
          base: "localEntry",
          pickedFields: [
            'id',
            'station',
            'type',
            'shortDescription',
            'songsCount',
            'entries']
        },
        cookies: {
          base: "localEntry",
          pickedFields: [
            'id',
            'station',
            'type',
            'shortDescription',
            'songsCount',
            'entries',
            'playedIDs'
          ]
        }
      };

      return localEntryFunc;
    });
})();
