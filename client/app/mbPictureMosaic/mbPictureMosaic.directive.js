'use strict';

angular.module('musicBucketApp')
  .directive('mbPictureMosaic', function ($interval) {
               return {
                 templateUrl: 'app/mbPictureMosaic/mbPictureMosaic.html',
                 restrict   : 'E',
                 scope      : {
                   pictures          : '=src',
                   pictureChangeSpeed: '=speed'
                 },
                 link       : function (scope, element, attrs) {
                   scope.$watch(scope.pictures, function (pics,oldPics) {
                     scope.pictures = _.first(_.uniq(scope.pictures), 6);
                   });
                   // scope.pictures = _.first(_.uniq(scope.pictures), 6);
                   //var test = angular.element(element.children()[0]);
                   if (_.isUndefined(scope.pictureChangeSpeed))
                     scope.pictureChangeSpeed = 1500;
                   scope.elementToClear = null;
                   scope.lastElement = null;
                   scope.lastElementIdx = 0;
                   function selectNext() {
                     var el = element[0].children[(scope.lastElementIdx++
                     ) % element[0].children.length];
                     return el;
                   }

                   function checkElement(el) {
                     return (!_.isUndefined(el) && !_.isNull(el));
                   }

                   function clearElement(el) {
                     if (checkElement(el))
                       el.className = "mb-picture-mosaic-picture";
                   }

                   function hideElement(el) {
                     if (checkElement(el))
                       el.className = "mb-picture-mosaic-picture hidden-pic";
                   }

                   function showElement(el) {
                     if (checkElement(el))
                       el.className = "mb-picture-mosaic-picture shown";
                   }

                   function changePictures() {
                     var next = selectNext();
                     var last = scope.lastElement;
                     scope.lastElement = next;
                     // if (checkElement(last)) {
                     //   changePictures();
                     //   return; // there is no last? wait till there is
                     // }
                     hideElement(last);
                     showElement(next);
                     if (checkElement(scope.elementToClear)
                     && scope.elementToClear !== last
                     && scope.elementToClear !== next)
                       clearElement(scope.elementToClear);
                     scope.elementToClear = last;
                   }
                   // Desynchronize:
                   // _.delay(function () {
                   //   $interval(changePictures, scope.pictureChangeSpeed);
                   // }, Math.random() * 500);
                 }
               };
             });
