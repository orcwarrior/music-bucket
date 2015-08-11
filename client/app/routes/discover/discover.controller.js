'use strict';

angular.module('musicBucketApp')
  .controller('discoverCtrl', function ($scope, mbPlayerEngine, lastFmApi) {

    $scope.curSong = function () {
      return mbPlayerEngine.getCurrentSong();
    };


    mbPlayerEngine.listen("songChange", function (engine, eventName, song) {
      initInfos(song);
    });
    function initInfos(song) {
      if (_.isUndefined($scope.artist))
        $scope.artist = {};

      console.log('[Discover] request artist infos...');
      lastFmApi.artist.getInfo(song.metainfos.artist)
        .then(function (response) {
          //$scope.$apply(function() {
          console.log('[Discover] artist data resolved.');
          $scope.__artist = response.data.artist;
          console.log('[Discover] artist.img: ' + $scope.artist.imageUrl);
          //);
        });
      lastFmApi.artist.getTopTracks(song.metainfos.artist)
        .then(function(response) {
          $scope.artistTopTracks = response.data.toptracks;
        });
    }

    if (!_.isUndefined($scope.curSong()))
      initInfos($scope.curSong());

    function paletteChangeHandler() {
      var img = document.querySelector('.discover-artist-col #artistImgPalette');
      angular.element(img).bind('paletteReady', function (srd, eventName, palette) {
        console.log('[Discover] artist image loaded.');
        $scope.artist = $scope.__artist;
        $scope.artist.imageUrl = $scope.__artist.image[4]['#text']
          || 'http://i.imgur.com/ha6KE5e.jpg';
      });
    };
    paletteChangeHandler();
  });
