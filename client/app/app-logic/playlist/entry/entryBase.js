/**
 * Created by orcwa on 17.11.2015.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('entryBase', function ($injector, songCommons) {

      var entryBase = function entryBase() {
      };
      entryBase.prototype = {
        getNext: function () {
          return new Error("getNext method from entryBase should be implemented!");
        },
        getPlayedCount: function () {
          return this.playedCount;
        },
        getSongsCount: function () {
          if (!this.songsCount)
            this.songsCount = _.reduce(this.entries, function(memo, song){ return memo + (song.state === songCommons.songState.deleted ? 0 : 1); }, 0);
          return this.songsCount;
        },
        getPlaylistDescription: function () {
          if (this.getSongsCount() > 1)
            return this.shortDescription + " (" + this.getPlayedCount() + "/" + this.getSongsCount() + ")";
          else
            return this.shortDescription;
        },
        getTitle: function () {
          return this.shortDescription;
        },
        resetPlayedSongs: function () {
          if (this.playedCount) this.playedCount = 0;
          if (this.playedIDs) this.playedIDs = [];
          // if (this.nonPlayedSongs) this.nonPlayedSongs = _.map(this.entries, function (e) {
          //   return e.id;
          // });
        },
        isActive: function () {
          // TODO: REFATOR!!!
          var engine = $injector.get('mbPlayerEngine');
          var song = engine.getCurrentSong();
          return !_.isUndefined(song) && this.id == song.entryId;
        },
        getName: function () {
          // Check if there's custon entry name too
          if (this._name)
            return this._name + " (" + this.getPlayedCount() + "/" + this.getSongsCount() + ")";
          else
            return this.getPlaylistDescription();
        },
        removeSong: function(song) {
          delete this.songsCount;
          return song.delete();
        },
        sort : function (entries) {
          var filteredEntries = _.filterObject(entries, function(val) { return val.state === songCommons.songState.deleted; });
          return _.sortBy(filteredEntries, function (song, idx) {
            return song.metainfos.getSongDescription();
          });
        }
      };
      return entryBase;
    });
})();
