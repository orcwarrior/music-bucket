'use strict';

angular.module('musicBucketApp')
  .controller('YoutubeCtrl', function ($scope, $location, youtubeEntryBuilder, mbPlayerEngine, youtubeApi) {

    $scope.addYTEntry = function (url) {
      mbPlayerEngine.getPlaylist().addEntry(new youtubeEntryBuilder(url));
    };
    $scope.ytSearch = function (searchQuery) {
      youtubeApi.search($scope.searchQuery, 50, {})
        .then(function (response) {
          $scope.ytClips = response.data.items;
        });
      youtubeApi.search($scope.searchQuery, 25, {type: 'playlist'})
        .then(function (response) {
          $scope.ytPlaylists = response.data.items;
        });

    };
    $scope.inteliSearch = function (str) {
      $location.search('query', str);
      $location.replace();

      if (str.indexOf("v=") !== -1 || str.indexOf("list=") !== -1)
        $scope.addYTEntry(str);
      else
        $scope.ytSearch(str);
    };

    $scope.ytUrl = "";
    $scope.searchQuery = $location.search().query;
    if ($scope.searchQuery) $scope.inteliSearch($scope.searchQuery);
  });
