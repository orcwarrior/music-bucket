'use strict';

angular.module('musicBucketApp')
  .controller('SongzaStationCtrl', function ($scope, $rootScope, $routeParams, songSongza, angularPlayer, songzaStation) {

                $scope.player = angularPlayer;
                var station = new songzaStation.constructor($routeParams.id);
                $scope.addToPlaylist = function() {
                  angularPlayer.addToPlaylist(station);

                }
                $scope.$on('Songza:Station-Update', function (event, data) {
                  $scope.$apply(function(){
                    $scope.station = data;

                  });
                });

  });
