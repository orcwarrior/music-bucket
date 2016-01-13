'use strict';

angular.module('musicBucketApp')
  .directive('mbAlbumTrack', function (songSeeker, mbPlayerEngine, mbStringUtils, $interval) {
    return {
      templateUrl: 'app/mbAlbumTrack/mbAlbumTrack.html',
      restrict: 'EA',
      scope: {
        track : '=track',
        palette: '=palette',
        artist: '@artist',
        album: '@album'
      },
      link: function (scope, element, attrs) {
        var normalizedMetainfos = { artist: scope.artist,
          album: mbStringUtils.normalizeAlbumNameString(scope.album),
          title: mbStringUtils.normalizeAlbumNameString(scope.track.name)
        };
        scope.isPlaying = function() {
          var curSong = mbPlayerEngine.getCurrentSong();
          if (_.isUndefined(curSong)) return false;
          scope._isPlaying = (normalizedMetainfos.title === mbStringUtils.normalizeAlbumNameString(curSong.metainfos.title)
          &&   (normalizedMetainfos.album === mbStringUtils.normalizeAlbumNameString(curSong.metainfos.album) || _.isUndefined(curSong.metainfos.album))
          &&   (normalizedMetainfos.artist === curSong.metainfos.artist));
          return scope._isPlaying;
        };
        // var playingCheck = $interval(scope.isPlaying, 1000);
        // scope.$on('$destroy', function() {
        //   $interval.cancel(playingCheck);
        // });

        scope.trackAction = function (action) {
          var metainfos = { artist: scope.artist, album: scope.album, title: scope.track.name };
          scope.isLoading = true;
          scope.actionsToggled = false;
          new songSeeker(metainfos, true)
            .then(function (song) {

              switch (action) {
                case "play" :
                  mbPlayerEngine.playSong(song, true);
                  break;
                case "play-next":
                  mbPlayerEngine.queueSongNext(song);
                  break;
                case "enqueue":
                  mbPlayerEngine.queueSong(song);
                  break;
              }
            });
        };
      }
    };
  });
