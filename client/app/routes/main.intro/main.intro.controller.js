'use strict';

angular.module('musicBucketApp')
  .controller('MainIntroCtrl', function ($scope, $http, mbPlayerEngine) {
    $scope.windLoc = window.location.host;

    $scope.curSong = function () {
      var song = mbPlayerEngine.getCurrentSong();
      return song && song.metainfos && song.metainfos.getSongDescription();
    }
    $http.get('/api/songzaLurker/stats')
      .then(function (response) {
        $scope.songzaLurkerStats = response.data;
      })
  });
