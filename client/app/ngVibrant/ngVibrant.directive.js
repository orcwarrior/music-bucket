'use strict';

angular.module('musicBucketApp')
  .directive('ngVibrant', function () {
    return {
      template: '',
      restrict: 'A',
      scope: { palette:'=ngVibrantPalette' },
      link: function (scope, element, attrs) {
        element.crossOrigin = 'anonymous'; // no credentials flag. Same as img.crossOrigin='anonymous'
        //element[0].style.display = 'none';
        element.bind("load", function(e) {
          var vibrant = new Vibrant(this);
          scope.palette = vibrant.swatches();
          //element[0].style.display = 'block';
          element.triggerHandler("paletteReady", scope.palette);
        });

          /*
           * Results into:
           * Vibrant #7a4426
           * Muted #7b9eae
           * DarkVibrant #348945
           * DarkMuted #141414
           * LightVibrant #f3ccb4
           */
        }
    };
  })
;
