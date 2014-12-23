'use strict';

angular.module('musicBucketApp')
  .controller('SongzaSearchCtrl',
              function ($scope, $rootScope, $location, $stateParams, $state, angularPlayer, songzaStation) {

                $scope.searchQuery = $location.search().query;
                $scope.searchInProgress = false;
                $scope.searchStations = function (query) {
                  $scope.searchInProgress = true;
                  $scope.foundedStations = null;
                  $location.search('query', query);
                  $location.replace();
                  $rootScope.songza.search.station(query, 50)
                    .then(function (response) {
                            $scope.$apply(function () {
                                            $scope.foundedStations = response;
                                            $scope.searchInProgress = false;
                                          }
                            );
                          })
                }

                $scope.gotoStation = function (stationId) {
                  //$state.go('^songza/station', {'id': stationId});
                };

                // if search query was passed, run station search
                if (!_.isUndefined($scope.searchQuery) && $scope.searchQuery !== "") {
                  $scope.searchStations($scope.searchQuery);
                }

                $scope.player = angularPlayer;
                $scope.addToPlaylist = function (station) {
                  var stationEntry = new songzaStation.constructor(station);
                  angularPlayer.addToPlaylist(stationEntry);
                }
                $scope.$on('Songza:Station-Update', function (event, data) {
                 // $scope.$apply(function () {
                 //   $scope.station = data;

                 // });
                });
              });
