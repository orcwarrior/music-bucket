'use strict';

angular.module('musicBucketApp')
  .directive('ngVibrant', function () {
    return {
      template: '',
      restrict: 'A',
      scope: {palette: '=ngVibrantPalette'},
      link: function (scope, element, attrs) {
        element.crossOrigin = 'anonymous'; // no credentials flag. Same as img.crossOrigin='anonymous'
        //element[0].style.display = 'none';
        element.bind("load", function (e) {
          var vibrant = new Vibrant(this);
          scope.palette = _processPalette(vibrant.swatches());
          //element[0].style.display = 'block';
          element.triggerHandler("paletteReady", scope.palette);
        });
        /*
         * bg: Vibrant  | fg: DarkVibrant/DarkMuted
         * bg: DarkMuted     | fg: w-grey/Vibrant ( whole bg)
         * bg: Muted         | fg: Vibrant (circles)
         * */
        function _processPalette(palette) {
          var avgFgLightness = (palette.Vibrant.hsl[2] + palette.Muted.hsl[2]) / 2;
          console.log("color: AVG.FG: " + avgFgLightness + ", DM: " + palette.DarkMuted.hsl[2]);
          if (palette.DarkMuted && palette.DarkMuted.hsl[2]) {
            console.log("DM.Color corrected by: " + palette.DarkMuted.hsl[2] + " => " + _fixColor(palette.DarkMuted.hsl[2], avgFgLightness, true, 2.0));
            palette.DarkMuted.hsl[2] = _fixColor(palette.DarkMuted.hsl[2], avgFgLightness, true);
            palette.DarkMuted.rgb = window.Vibrant.hslToRgb(
              palette.DarkMuted.hsl[0],
              palette.DarkMuted.hsl[1],
              palette.DarkMuted.hsl[2]);
          }
          if (palette.Muted && palette.Muted.hsl[2]) {
            console.log("M.Color corrected by: " + palette.Muted.hsl[2] + " => " + _fixColor(palette.Muted.hsl[2], palette.DarkMuted.hsl[2], false, 2.5));
            palette.Muted.hsl[2] = _fixColor(palette.Muted.hsl[2], palette.DarkMuted.hsl[2], false, 1.3);
            palette.Muted.rgb = window.Vibrant.hslToRgb(
              palette.Muted.hsl[0],
              palette.Muted.hsl[1],
              palette.Muted.hsl[2]);
          }
          if (palette.DarkVibrant && palette.DarkVibrant.hsl[2]) {
            console.log("DV.Color corrected by: " + palette.DarkVibrant.hsl[2] + " => " + _fixColor(palette.DarkVibrant.hsl[2], palette.Vibrant.hsl[2], true));
            palette.DarkVibrant.hsl[2] = _fixColor(palette.DarkVibrant.hsl[2], palette.Vibrant.hsl[2], true);
            palette.DarkVibrant.rgb = window.Vibrant.hslToRgb(
              palette.DarkVibrant.hsl[0],
              palette.DarkVibrant.hsl[1],
              palette.DarkVibrant.hsl[2]);
          }
          if (palette.Vibrant && palette.Vibrant.hsl[2]) {
            console.log("V.Color corrected by: " + palette.Vibrant.hsl[2] + " => " + _fixColor(palette.Vibrant.hsl[2], palette.DarkMuted.hsl[2], false, 3.5));
            palette.Vibrant.hsl[2] = _fixColor(palette.Vibrant.hsl[2], palette.DarkMuted.hsl[2], false, 1.3);
            palette.Vibrant.rgb = window.Vibrant.hslToRgb(
              palette.Vibrant.hsl[0],
              palette.Vibrant.hsl[1],
              palette.Vibrant.hsl[2]);
          }
          // DarkMutedAlt(ernative):
          palette.DarkMutedAlt = new Swatch(palette.DarkMuted.rgb, 0);
          palette.DarkMutedAlt.getHsl();
          palette.DarkMutedAlt.hsl[2] *= 0.98;
          palette.DarkMutedAlt.hsl[1] *= 1.02;
          palette.DarkMutedAlt.rgb = window.Vibrant.hslToRgb(
            palette.DarkMutedAlt.hsl[0],
            palette.DarkMutedAlt.hsl[1],
            palette.DarkMutedAlt.hsl[2]);

          return palette;
        }

        function absMax(x, y) {
          if (Math.abs(x) > Math.abs(y))
            return x;
          else return y;
        }

        function sign(x) {
          return x ? x < 0 ? -1 : 1 : 0;
        }

        // fixing color means distancing values (more if they nearer, less if they have bigger dist.
        // between)
        var _fixColor = function (col, refCol, forceNegative, multipiler) {
          var diff = col - refCol;
          multipiler = multipiler || 1;
          // console.log("color: " + col + " + (" + col + "/(" + diff * 100 + "or2)");
          if (forceNegative)
            return Math.max(0.08, col - (col / Math.abs(absMax(2 * sign(diff), diff * 100))) * multipiler);
          else
            return Math.min(1, col + (col / absMax(2 * sign(diff), diff * 100)) * multipiler);
        };
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
