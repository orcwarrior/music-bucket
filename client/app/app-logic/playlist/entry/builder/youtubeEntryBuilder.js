/**
 * Created by orcwa on 23.01.2016.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('youtubeEntryBuilder', function ($q, $injector, entryCommons, songCommons, youtubePlaylistEntry, virtualEntry, song, entryBuilder) {

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
        } else {
          return entry.match(playlistRegex()) !== null; // no playlist string, so it's single video
        }
      }

      const ytVirtualEntryName = "Youtube Videos";

      function getYTVideosVirtualEntry() {
        var mbPlayerEngine = $injector.get('mbPlayerEngine');
        var curPlaylist = mbPlayerEngine.getPlaylist();
        if (curPlaylist) {
          var ytVideosEntries = curPlaylist.findEntry({id: 'VIR-' + ytVirtualEntryName});
          if (_.isUndefined(ytVideosEntries)) {
            ytVideosEntries = new virtualEntry(ytVirtualEntryName, undefined, entryCommons.nextOrder.random);
            // it's need to be added (shouldn't be done actually here)
          }
          return ytVideosEntries;
        }
      }

      var youtubeEntryBuilder = function albumEntryBuilder() {
        this.build = function (infos, restoredObj) {
          var deffered = $q.defer();
          if (isYoutubePlaylist(infos)) {
            var ytPlaylist = new youtubePlaylistEntry(infos);

            ytPlaylist.__entriesPromise.then(function(resolvedEntries) {
              if (restoredObj)
                ytPlaylist = _.deepExtend(ytPlaylist, restoredObj);
              // setup builder
              ytPlaylist.__builder__ = {name: 'youtubeEntryBuilder', data: infos};
              deffered.resolve(ytPlaylist);
            });
          } else {
            var virtualEntry = getYTVideosVirtualEntry();
            var ytId = infos.videoId || extractIdFromUrl(infos);
            virtualEntry.addSong(new song(ytId, songCommons.songType.youtube, ytId));
            // this.entries = [new song(this.id, songCommons.songType.youtube, this.id)];
            deffered.resolve(virtualEntry);
          }
          return deffered.promise;
        };
      };
      youtubeEntryBuilder.prototype = entryBuilder;
      return new youtubeEntryBuilder();
    });
})();
