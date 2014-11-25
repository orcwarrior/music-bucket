'use strict';

angular.module('musicBucketApp')
  .controller('LocalCtrl', function ($scope, $rootScope, songLocal, angularPlayer) {

                $scope.$watch("droppedFiles",
                              function(val, oldVal, scope) {
                                if(_.isUndefined(val)) return;

                                $rootScope.playlist = $rootScope.playlist || [];
                                for(var i=0;i<$scope.droppedFiles.length; i++) {
                                  var song = songLocal.constructor($scope.droppedFiles[i]);

                                    if ($scope.song === undefined)
                                      $scope.song = song.shared;

                                }
                              });
  });
