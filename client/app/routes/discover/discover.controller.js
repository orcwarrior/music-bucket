'use strict';

angular.module('musicBucketApp')
  .controller('discoverCtrl', function ($scope, $timeout, $location, mbPlayerEngine, lastFmApi, songBuilder) {

    $scope.artist = {};
    var lastSong = {};
    var storedPlaysCounts = [];

    if (!_.isEmpty(_buildParamsSongPlaceholder())) {
      var paramsSong = _buildParamsSongPlaceholder();
      initInfos(paramsSong);
    }

    $scope.curSong = function () {
      return mbPlayerEngine.getCurrentSong();
    };
    $scope.songAction = function (action, query, idx) {
      // All visual stuff:
      $scope.artistTopTracks.track[idx].isLoading = true;
      storedPlaysCounts[idx] = $scope.artistTopTracks.track[idx].playcount;
      $scope.artistTopTracks.track[idx].playcount = 0;
      $timeout(function () {
        setTrackProgress(idx, 0.5)
      }, 100);
      $timeout(function () {
        setTrackProgress(idx, 1)
      }, 500);
      $timeout(function () {
        setTrackProgress(idx, 0)
      }, 1000);
      $timeout(function () {
        setTrackProgress(idx, 1)
      }, 1600);

      songBuilder.createSong(query)
        .then(function (song) {
          $scope.artistTopTracks.track[idx].playcount = storedPlaysCounts[idx];
          $scope.artistTopTracks.track[idx].isLoading = false;

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

    mbPlayerEngine.listen("songChange", function (engine, eventName, song) {
      initInfos(song);
    });

    function initInfos(song) {

      console.log('[Discover] request artist infos: ' + song.metainfos.artist);
      /*
       * Artist column
       * */
      if (_.isUndefined(lastSong.artist) || lastSong.artist.toUpperCase() !== song.metainfos.artist.toUpperCase()) {

        (function artistInfos() {
          lastFmApi.artist.getInfo(song.metainfos.artist)
            .then(function (response) {
              //$scope.$apply(function() {
              console.log('[Discover] artist data resolved.');
              $scope.__artist = response.data.artist;
              $scope.$broadcast('discover:artist:updated');
              //);
            });
          lastFmApi.artist.getTopTracks(song.metainfos.artist)
            .then(function (response) {
              $scope.artistTopTracks = response.data.toptracks;
              $scope.artistTopTracks.maxplayscount = $scope.artistTopTracks.track[0].playcount;
              $scope.$broadcast('discover:artist:updated');
            });
        })();
      }
      else
        console.info("[Discover] arist was already loaded: " + lastSong.artist);

      /*
       * Album column
       * */
      // TO DO Some parraler task management etc.
      lastSong = song.metainfos;
    }

    if (!_.isUndefined($scope.curSong()))
      initInfos($scope.curSong());

    function paletteChangeHandler() {
      var img = document.querySelector('.artist-col-wrapper #artistImgPalette');
      angular.element(img).bind('paletteReady', function (srd, eventName, palette) {
        console.log('[Discover] artist image loaded.');
        $scope.artist = $scope.__artist;
        $scope.artist.imageUrl = $scope.__artist.image[4]['#text']
          || 'http://i.imgur.com/ha6KE5e.jpg';
        $scope.$broadcast('discover:artist:updated');

        // Update url params when transistions are done :)
        $timeout(function () {
          _updateUrlParams(lastSong);
        }, 1000)
      });
    };
    $timeout(function() {
      paletteChangeHandler();
    }, 100);

    function setTrackProgress(idx, percentProgress) {
      if ($scope.artistTopTracks.track[idx].playcount === storedPlaysCounts[idx])
        return; // already loaded.
      $scope.artistTopTracks.track[idx].playcount = $scope.artistTopTracks.maxplayscount * percentProgress;

    }

    function _updateUrlParams(songMetainfos) {
      var anyChanges = false;
      if ($location.search().artist != songMetainfos.artist
        || $location.search().title != songMetainfos.title
        || $location.search().album != songMetainfos.album)
        anyChanges = true;

      $location.search('artist', songMetainfos.artist);
      $location.search('title', songMetainfos.title);
      $location.search('album', songMetainfos.album);

      if (anyChanges)
        $location.replace();
    }

    function _buildParamsSongPlaceholder() {
      if ($location.search().artist) {
        return {metainfos: _.pick($location.search(), 'artist', 'album', 'title')};
      } else
        return {};
    }
  });
