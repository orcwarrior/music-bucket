/**
 * Created by orcwarrior on 2014-11-11.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlist', function (playlistLocalStorage, playlistSequencers, playlistService) {

      function rewriteBase(base) {
        if (!_.isUndefined(base)) {
          this.entries = base.entries;
          this.songsCount = base.entriesCount;
        }
      }

      function putSongToSampler(playlist, song) {
        var samplerSize = 6;
        if (song.metainfos.albumArt && !song.metainfos.albumArtAttached && playlist.sampleSongs.length < samplerSize) {
          playlist.sampleSongs.push({src: song.metainfos.albumArt, description: song.metainfos.getSongDescription()});
        } else if (Math.random() > 0.9 && playlist.sampleSongs.length === samplerSize) {
          playlist.sampleSongs[Math.round(Math.random() * samplerSize)] = {
            src: song.metainfos.albumArt,
            description: song.metainfos.getSongDescription()
          };
          playlistService.save(playlist);
        }
        else {
          return; // break from storing again in db
        };
      }

      return function playlist (base) {
          var self = this;

          this.name = '';
          this.entries = [];

          this.playlistSequencer = playlistSequencers['default'];
          this.nextPlaylistSequencer = function () {
            var playlistSequencersArr = playlistSequencers.toArray();
            var thisIdx = playlistSequencersArr.indexOf(this.playlistSequencer);
            var nextIdx = ++thisIdx % playlistSequencersArr.length;
            this.playlistSequencer = playlistSequencersArr[nextIdx];
          };

          this.sampleSongs = [];
          this.isAltered = false;

          _.extend(this, playlistLocalStorage);
          _.extend(this, base);

          // methods:
          this.getNext = function () {
            return this.playlistSequencer.getNext(this.entries, this.songsCount, this.getNextCallback);
            /* an promise*/
          };
          this.getNextCallback = function (song) {
            putSongToSampler(self, song);
          };
          this.addEntry = function (entry) {
            this.entries.push(entry);
            this.alter();
          };
          this.removeEntry = function (entryId) {
            this.entries = _.reject(this.entries, function (entry) {
              return entry.id == entryId;
            });
            this.alter();
          };

          this.alter = function () {
            this.isAltered = true;
            this.sampleSongs.splice(Math.round(this.sampleSongs.length * Math.random()), 1);
            this.recalculateSongsCount();
            this.storeInLocalstorage();
          };
          this.recalculateSongsCount = function () {
            this.songsCount = 0;
            _.each(this.entries, function (entry) {
              if (!_.isUndefined(entry.songsCount))
                self.songsCount += entry.songsCount;
              else
                self.songsCount++;
            });
          };
          return this;
      };
    })
})();
