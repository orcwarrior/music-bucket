/**
 * Created by orcwarrior on 2015-03-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('youtubePlaylistEntry', function (entryCommons, entryBase, song, songCommons, youtubeApiHelper, $q) {


      function playlistRegex() {
        return /[?&]list=([\S?&#]+?)($|[?&#])/g;
      }

      function videoRegex() {
        return /[?&]v=([\S?&#]+?)($|[?&#])/g;
      }

      function extractIdFromUrl(url) {
        match = playlistRegex().exec(url);
        if (_.isNull(match)) {
          var match = videoRegex().exec(url);
          if (_.isNull(match)) throw new Error("Wrong YT url!");
          return match[1];
        } else {
          return match[1];
        }
      }

      function getShortDescription(plEntry) {
        return youtubeApiHelper.getPlaylist(plEntry.id);
      }

      var youtubePlaylistEntryFunc = function youtubePlaylistEntry(url) {
        var self = this;
        this.url = url;
        if (_.isObject(url)) {
          this.id = url.videoId || url.playlistId;
          this.type = (url.kind === "youtube#video") ? entryCommons.entryType.youtubeVideo : entryCommons.entryType.youtubePlaylist;
        }
        else {
          this.id = extractIdFromUrl(url);
          this.type = entryCommons.entryType.youtubePlaylist;
        }
        this.songsCount = 1; // TODO: Playlist case.
        this.playedIDs = [];
        this.playedCount = 0;
        {
          youtubeApiHelper.getPlaylistEntries(this.id)
            .then(function (entries) {
              self.entries = {};
              _.each(entries, function (entry) {
                var _song = new song(entry.snippet.resourceId.videoId, songCommons.songType.youtube);
                _song.entryId = self.id;
                self.entries[_song.id] = _song;
              });
              self.songsCount = entries.length;

              if (_.isUndefined(self.shortDescription))
                self.shortDescription = "Playlista youtube: " + self.id;
            });
          getShortDescription(this)
            .then(function (response) {
              self.shortDescription = response.data.items[0].snippet.title;
            });
        }

        this.getPlaylistDescription = function () {
          return youtubePlaylistEntryFunc.prototype.getPlaylistDescription.call(this);
        };
        this.getNext = function (options) {
          var ytPromise = $q.defer();
          var selectedEntry;
          // has some concrete ID to play?
          if (!_.isUndefined(options.songId)) {
            ytPromise.resolve(_.find(this.entries, _.matcher({id: options.songId})));
            return ytPromise.promise;
          }

          // Resolve after metainfos gathered???
          if (_.isUndefined(this.entries)) { // still not instanitated - recurency save'us
            _.delay(function () {
              self.getNext(options)
                .then(function (next) {
                  ytPromise.resolve(next);
                });
            }, 500);
            return ytPromise.promise;
          }
          selectedEntry = _.sample(this.entries);
          // Already played?
          if (_.some(this.playedIDs, function (pID) {
              return pID == selectedEntry.metainfos.id;
            })
            && (!options.force && this.playedIDs.length !== this.songsCount)) {
            console.log("Video:", selectedEntry.metainfos.id, "already played!");
            if (this.playedIDs.length >= this.songsCount)
              ytPromise.reject();
            else
              return this.getNext(options);
          }
          else console.log("New video: " + selectedEntry.metainfos.id);
          this.playedIDs.push(selectedEntry.metainfos.id);
          console.log(this.playedIDs);
          this.playedCount = self.playedIDs.length;
          ytPromise.resolve(selectedEntry);
          if (_.isFunction(options.playlistCallback))
            options.playlistCallback(selectedEntry);
          return ytPromise.promise;
        };
      };

      youtubePlaylistEntryFunc.prototype = new entryBase();
      youtubePlaylistEntryFunc.prototype.__models__ = {
        db: {
          base: "youtubePlaylistEntry",
          constructorArgs: ['url'],
          pickedFields: [
            'id',
            'url',
            'type',
            'shortDescription',
            'songsCount']
        },
        cookies: {
          base: "youtubePlaylistEntry",
          constructorArgs: ['url'],
          pickedFields: [
            'id',
            'url',
            'type',
            'playedIDs',
            'playedCount',
            'shortDescription',
            'songsCount']
        }
      };
      return youtubePlaylistEntryFunc;
    }
  )
  ;
})();
