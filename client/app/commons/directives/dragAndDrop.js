/**
 * Created by orcwarrior on 2014-11-11.
 */
  angular.module('musicBucketApp').
    directive('dragAndDrop', function () {
                return {
                  restrict: 'A',
                  link    : function ($scope, elem, attr) {
                    elem.bind('dragover', function (e) {
                      e.stopPropagation();
                      e.preventDefault();
                      e.originalEvent.dataTransfer.dropEffect = 'copy';
                    });
                    elem.bind('dragenter', function (e) {
                      e.stopPropagation();
                      e.preventDefault();
                      $scope.$apply(function () {
                        elem[0].classList.add('active');
                      });
                    });
                    elem.bind('dragleave', function (e) {
                      e.stopPropagation();
                      e.preventDefault();
                      $scope.$apply(function () {
                        elem[0].classList.remove('active');
                      });
                    });
                    elem.bind('drop', function (e) {
                      var droppedFiles = e.originalEvent.dataTransfer.files;
                      e.stopPropagation();
                      e.preventDefault();
                      $scope.droppedFiles = [];
                      // e.originalEvent.dataTransfer.getData('text/uri-list') // to get dropped data
                      for (var i = 0; i < droppedFiles.length; i++) {
                        $scope.droppedFiles.push(droppedFiles[i]);
                      }
                      $scope.$apply();
                    });
                  }
                };
              });
