'use strict';

angular.module('musicBucketApp')
  .controller('SongzaSearchCtrl', function ($scope, $rootScope, $routeParams, $location) {
                $scope.message = 'Hello';
                $scope.searchQuery = $routeParams.query;

                $scope.searchStations = function (query) {
                  $scope.foundedStations = null;
                  $location.search('query', query);
                  $location.replace();
                  $rootScope.songza.search.station(query, 50)
                    .then(function (response) {
                            $scope.$apply(function () {
                                            $scope.foundedStations = response;
                                          }
                            );
                          })
                }

                $scope.gotoStation = function (stationId) {
                  $state.go('^songza/station', {'id' : stationId});
                };

                if (!_.isUndefined($scope.searchQuery)) {
                  $scope.searchStations($scope.searchQuery);
                }
              });
