/**
 * Created by orcwa on 17.11.2015.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('entryBase', function ($injector) {

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
          if (_.isUndefined(this.entries[song.id])) return $log.warn("There is no song with id: " + song.id);
          delete this.entries[entry.id];

          if (this.playedIDs) {
            var altered = _.without(this.playedIDs, song.id);
            if (altered.length !== this.playedIDs.length)
              this.playedCount--;
            this.playedIDs = altered;
          }
        },
        sort : function (entries) {
          return _.sortBy(entries, function (song, idx) {
            return song.metainfos.getSongDescription();
          });
        }
      };
      return entryBase;
    });
})();
