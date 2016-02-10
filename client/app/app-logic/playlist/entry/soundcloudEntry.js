/**
 * Created by orcwarrior on 2015-03-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('soundcloudEntry', function (entryCommons, entryBase, song, songCommons, $q) {

      var soundcloudEntryFunc = function soundcloudEntry(soundcloudTrackObj) {
        var self = this;
          this.id = soundcloudTrackObj.id;
        if (soundcloudTrackObj.type !== "eSoundcloudTrack") {
          this.entries = [new song(soundcloudTrackObj, songCommons.songType.soundcloud, this.id)];
        } else {
          this.entries = [];
        }
        this.type = entryCommons.entryType.soundcloudTrack;
        this.songsCount = 1;
        this.playedIDs = [];
        this.playedCount = 0;
        this._scObj = soundcloudTrackObj;


        this.getPlaylistDescription = function () {
          return this.entries[0].metainfos.getSongDescription();
        };
        this.getTitle = function () {
          return this.shortDescription || this.entries[0].metainfos.getSongDescription();
        };
        this.getNext = function (options) {
          var scPromise = $q.defer();
          var selectedEntry = this.entries[0];
          scPromise.resolve(selectedEntry);
          if (_.isFunction(options.playlistCallback))
            options.playlistCallback(selectedEntry);
          this.playedCount = 1;
          return scPromise.promise;
        };
      };
      soundcloudEntryFunc.prototype = new entryBase();
      soundcloudEntryFunc.prototype.__models__ = {
        db: {
          base: "soundcloudEntry",
          constructorArgs: ['$this'],
          pickedFields: [
            'id',
            'type',
            'shortDescription',
            'songsCount',
            'entries']
        },
        cookies: {
          base: "soundcloudEntry",
          constructorArgs: ['$this'],
          pickedFields: [
            'id',
            'type',
            'shortDescription',
            'songsCount',
            'entries',
            'playedIDs'
          ]
        }
      };

      return soundcloudEntryFunc;
    })
})();
