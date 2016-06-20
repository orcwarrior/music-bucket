'use strict';

angular.module('musicBucketApp')
  .controller('SpotifyCategoriesCtrl', function ($scope, $stateParams, spotifyApi) {
    $scope.message = 'Hello';
    spotifyApi.browse.categories.list(30)
      .then(function (response) {
        $scope.categories = response.data.categories;
      });

    $scope.goBack = function () {
      delete $scope.selectedCategory;
      delete $scope.categoryPlaylists;
    };
    $scope.openCategory = function (categoryObj) {
      $scope.selectedCategory = categoryObj;
      spotifyApi.browse.categories.getPlaylists(categoryObj.id)
        .then(function (response) {
          $scope.categoryPlaylists = response.data.playlists;
        });
    };
  });
