/**
 * Created by orcwarrior on 2015-07-23.
 */

angular.module('musicBucketApp')
.controller('PlaylistSaveDialogController', function ($mdDialog, $scope, playlist, playlistService) {

  $scope.playlist = playlist || {
    tags: ['pop', 'alternative', 'easy-listening'],
    name: "Crowd pleasing",
    songsCount: 172,
    visibility: 'public',
    authorName: "orcwarrior"
  };
  if (_.isUndefined(playlist.tags))
    playlist.tags = [];

  $scope.coverEditingIcon = 'insert_photo';
  $scope.acceptMsg = "Save";

  $scope.toggleCoverEditing = function () {
    $scope.coverEditing = !$scope.coverEditing;
    $scope.coverEditingIcon = ($scope.coverEditing) ? 'done' : 'insert_photo';
  }
  $scope.hide = function () {
    $mdDialog.hide();
  };
  $scope.cancel = function () {
    $mdDialog.cancel();
  };
  $scope.answer = function (answer) {
    if (answer === 'save')
      playlistService.save($scope.playlist);
    $mdDialog.hide(answer);
  }
});
