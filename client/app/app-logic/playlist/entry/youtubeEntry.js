/**
 * Created by orcwarrior on 2015-03-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('youtubeEntry', function (entryCommons, song, songCommons) {

      var playlistRegex = /[?&]list=(\w.*?)($|[?&])/g;
      var videoRegex = /[?&]v=(\w.*?)($|[?&])/g;

      function extractIdFromUrl(url) {
        var match = playlistRegex.exec(url);
        if (_.isNull(match)) {
          match = videoRegex.exec(url);
          if (_.isNull(match)) throw new Error("Wrong YT url!");
          return match[1];
        } else {
          return match[1];
        }
      }
      function createPlaylistEntries(entry) {

      }
      function isYoutubePlaylist(entry) {
        if (!_.isUndefined(entry.type)) {
          if (entry.type === entryCommons.entryType.youtubePlaylist) return true;
          else if (entry.type === entryCommons.entryType.youtubeVideo) return false;
          else throw new Error("isYoutubePlaylist function called on non-yt entry!");
        }
        return entry.url.match(playlistRegex) !== null; // no playlist string, so it's single video
      }

      return function youtubeEntry(url) {
        var self = this;
        this.url = url;
        this.id = extractIdFromUrl(url);
        this.type = isYoutubePlaylist(this) ? entryCommons.entryType.youtubePlaylist : entryCommons.entryType.youtubeVideo;
        this.songsCount = 1; // TODO: Playlist case.

        if (isYoutubePlaylist(this)) {
          createPlaylistEntries(this)
            .then(function(entries) {
            this.entries = entries;
          });
        } else {
          this.entries = [new song(this.id, songCommons.songType.youtube)];
        }
        this.shortDescription = "???";
        _.map(this.entries, function (song) {
          song.entryId = self.id;
        });


      }
    }
  )
  ;
})();
