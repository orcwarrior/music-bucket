/**
 * Created by orcwarrior on 2014-11-11.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlist', function (playlistLocalStorage, playlistSequencers, $log, $rootScope) {

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
          // if (playlistService.isPlaylistOwner(playlist))
          //   playlistService.save(playlist);
        }
        else {
          return; // break from storing again in db
        };
      }

      var playlistFunc = function playlist(base) {
        var self = this;

        function init() {
          self.name = '';
          self.entries = {};
          self.description = '';
          self.sampleSongs = [];
          self.isAltered = false;
        }

        init();

        this.clear = function () {
          init();
        }

        this.playlistSequencer = playlistSequencers['random'];
        this.nextPlaylistSequencer = function () {
          this.playlistSequencer.unset();
          var playlistSequencersArr = playlistSequencers.toArray();
          var thisIdx = playlistSequencersArr.indexOf(this.playlistSequencer);
          var nextIdx = ++thisIdx % playlistSequencersArr.length;
          this.playlistSequencer = playlistSequencersArr[nextIdx];
          this.playlistSequencer.setup();
        };

        _.extend(this, playlistLocalStorage);
        _.extend(this, base);

        // methods:
        this.isEmpty = function () {
          return !_.allKeys(this.entries).length;
        };
        this.getNext = function () {
          return this.playlistSequencer.getNext(_.values(this.entries), this.songsCount, {playlistCallback: this.getNextCallback});
          /* an promise*/
        };
        this.getNextCallback = function (song) {
          putSongToSampler(self, song);
        };
        this.addEntry = function (entry) {
          if (!_.isUndefined(this.entries[entry.id])) return $log.warn("There is already entry with id: " + entry.id);

          this.entries[entry.id] = entry;
          this.alter();
        };
        this.removeEntry = function (entry) {
          if (!_.isUndefined(this.entries[entry.id])) return $log.warn("There is no entry with id: " + entry.id);
          delete this.entries[entry.id];
          this.alter();
        };
        this.findEntry = function (entryMask) {
          return _.find(this.entries, _.matcher(entryMask));
        };
        this.resetPlayedSongs = function () {
          _.each(this.entries, function(entry) {
            entry.resetPlayedSongs();
          });
          this.alter();
        };

        this.alter = function () {
          this.isAltered = true;
          this.modified = new Date();
          this.sampleSongs.splice(Math.round(this.sampleSongs.length * Math.random()), 1);
          this.recalculateSongsCount();
          this.storeInLocalstorage();

          $rootScope.$broadcast('list-scroll:update', this);
          $rootScope.$broadcast('playlist:update', this);
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

      playlistFunc.prototype.__models__ = {
        db: {
          base: "playlist",
          pickedFields: [
            'id',
            'author',
            'authorName',
            'name',
            'songsCount',
            'sampleSongs',
            'visibility',
            'tags',
            'imageUrl',
            'modified',
            'description',
            'entries']
        },
        cookies: {
          base: "playlist",
          pickedFields: [
            'id',
            'author',
            'authorName',
            'name',
            'songsCount',
            'sampleSongs',
            'visibility',
            'tags',
            'imageUrl',
            'modified',
            'description',
            'playlistSequence',
            'isAltered',
            'entries'
          ]
        }
      };

      return playlistFunc;
    })
})();
