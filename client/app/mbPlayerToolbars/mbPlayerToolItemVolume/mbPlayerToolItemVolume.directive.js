'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerToolItemVolume', function (mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayerToolbars/mbPlayerToolItemVolume/mbPlayerToolItemVolume.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {

        var thumbContainer = angular.element(element[0].querySelector('.md-thumb-container'));
        var slider = angular.element(element[0].querySelector('.md-slider-wrapper'))
        slider.on("mousemove", function (ev) {
          // console.log("Mouse moved: " + scope.volume); //console.log(ev);
          var vol = parseInt(thumbContainer.css("left"));
          // scope.volume = vol;
          vol = vol * (vol/75);
          vol = Math.min(vol, 100);
          mbPlayerEngine.setVolume(vol);
        })
        scope.volume = mbPlayerEngine.getVolume() || 100;

      }
    };
  });
