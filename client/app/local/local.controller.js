'use strict';

angular.module('musicBucketApp')
  .controller('LocalCtrl', function ($scope, $rootScope, songLocal, localEntry, angularPlayer) {

                $scope.$watch("droppedFiles",
                              function(val, oldVal, scope) {
                                if(_.isUndefined(val)) return;
                                var songs = [], localSongEntries = [];
                                $rootScope.playlist = $rootScope.playlist || [];
                                for(var i=0; i<$scope.droppedFiles.length; i++) {
                                  songs[i] = new songLocal.constructor($scope.droppedFiles[i]);
                                  localSongEntries[i] = new localEntry.constructor(songs[i]);
                                  angularPlayer.addToPlaylist(localSongEntries[i]);
                                  // dbg
                                  var file = $scope.droppedFiles[i];
                                  console.log(file.name.substr(0,file.name.lastIndexOf('.')))
                                }
                              });
  });
