'use strict';

angular.module('musicBucketApp')
  .controller('YoutubeCtrl', function ($scope, youtubeEntry, angularPlayer) {
    $scope.ytUrl = "";
    $scope.addYTEntry = function() {
      angularPlayer.getPlaylist().addEntry( new youtubeEntry($scope.ytUrl));
    };

  });
