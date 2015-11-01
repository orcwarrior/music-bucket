/**
 * Created by orcwarrior on 2015-03-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('youtubeEntry', function (entryCommons, song, songCommons, youtubeApiHelper, $q) {

      // NOTE: Strange bug, regex instances cannot be again matched:
      //var playlistRegex = /[?&]list=([\S?&]+)($|[?&])/g;
      //var videoRegex = /[?&]v=([\S?&]+)($|[?&])/g;
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

      function isYoutubePlaylist(entry) {
        if (!_.isUndefined(entry.type)) {
          if (entry.type === entryCommons.entryType.youtubePlaylist) return true;
          else if (entry.type === entryCommons.entryType.youtubeVideo) return false;
          else throw new Error("isYoutubePlaylist function called on non-yt entry!");
        }
        return entry.url.match(playlistRegex()) !== null; // no playlist string, so it's single video
      }

      return function youtubeEntry(url) {
        var self = this;
        this.url = url;
        if (_.isObject(url)) {
          this.id = url.videoId || url.playlistId;
          this.type = (url.kind === "youtube#video") ? entryCommons.entryType.youtubeVideo : entryCommons.entryType.youtubePlaylist;
        }
        else {
          this.id = extractIdFromUrl(url);
          this.type = isYoutubePlaylist(this) ? entryCommons.entryType.youtubePlaylist : entryCommons.entryType.youtubeVideo;
        }
        this.songsCount = 1; // TODO: Playlist case.
        this.playedIDs = [];
        this.playedCount = 0;

        if (isYoutubePlaylist(this)) {
          youtubeApiHelper.getPlaylistEntries(this.id)
            .then(function (entries) {
              self.entries = _.map(entries, function (entry) { return new song(entry.snippet.resourceId.videoId, songCommons.songType.youtube); });
              self.songsCount = entries.length;
            });
          getShortDescription(this)
            .then(function (response) {
              self.shortDescription = response.data.items[0].snippet.title;
            });
        } else {
          this.entries = [new song(this.id, songCommons.songType.youtube, this.id)];
        }

        this.shortDescription = "Playlista youtube: " + this.id;
        _.map(this.entries, function (song) {
          song.entryId = self.id;
        });

        this.getPlaylistDescription = function () {
          if (isYoutubePlaylist(this)) return this.shortDescription + "(" + this.playedCount + "/" + this.songsCount + ")";
          else return this.entries[0].metainfos.getSongDescription();
        }
        this.getNext = function (options) {
          var ytPromise = $q.defer();
          var selectedEntry;
          // Resolve after metainfos gathered???
          if (isYoutubePlaylist(this)) {
            if (_.isUndefined(this.entries)) { // still not instanitated - recurency save'us
              _.delay(function () {
                self.getNext(options)
                  .then(function (next) {
                    ytPromise.resolve(next);
                  });
              }, 500);
              return ytPromise.promise;
            }

            var idx = Math.round(Math.random() * this.entries.length);
            selectedEntry = this.entries[idx];
          } else {
            selectedEntry = this.entries[0];
          }
          // Already played?
          if (_.some(this.playedIDs, function (pID) { return pID == selectedEntry.metainfos.id; })
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
      }
    }
  )
  ;
})();
