/**
 * Created by orcwa on 23.01.2016.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('youtubeEntryBuilder', function ($injector, entryCommons, songCommons, youtubePlaylistEntry, virtualEntry, song) {

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

      function isYoutubePlaylist(entry) {
        if (_.isObject(entry)) {
          return (entry.kind !== "youtube#video");
        }
        return entry.match(playlistRegex()) !== null; // no playlist string, so it's single video
      }
      const ytVirtualEntryName = "Youtube Videos";
      function getYTVideosVirtualEntry() {
        var mbPlayerEngine = $injector.get('mbPlayerEngine');
        var curPlaylist = mbPlayerEngine.getPlaylist();
        if (curPlaylist) {
          var ytVideosEntries = curPlaylist.findEntry({id: 'VIR-'+ytVirtualEntryName});
          if (_.isUndefined(ytVideosEntries)) {
            ytVideosEntries = new virtualEntry(ytVirtualEntryName,[], entryCommons.nextOrder.random)
          }
          return ytVideosEntries;
        }
      }

      var youtubeEntryBuilderFunc = function youtubeEntryBuilder(entry) {
          if (isYoutubePlaylist(entry)) {
            return new youtubePlaylistEntry(entry);
          } else {
            var virtualEntry = getYTVideosVirtualEntry();
            var ytId = entry.videoId || extractIdFromUrl(entry);
            virtualEntry.addSong(new song(ytId, songCommons.songType.youtube, ytId));
            // this.entries = [new song(this.id, songCommons.songType.youtube, this.id)];
            return virtualEntry;
          }
      };

      return youtubeEntryBuilderFunc;
    });
})();
