'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerPlaylist', function ($document, $window) {
    return  {
      templateUrl: 'app/mbPlayerPlaylist/mbPlayerPlaylist.html',
      restrict: 'EA',
        scope: {
        playlist: '=playlist'
      },
      link: function (scope, element, attrs) {
        var NAVBAR_HEIGHT = 50;
        var TOOLBAR_HEIGHT = 0;       // TODO: In toolbarService store some toolbarHeight value
        var MAINCONTROLL_HEIGHT = 320; // TODO: From where playerMainControlls Height should be taken???
        element.css({
                      display: 'block',
                     'overflow-y': 'auto'
                    });

        // Recalculate element height on window resize (responsiveness)
        angular.element($window).bind('resize', function() {
          recalculateHeight();
          scope.$apply();
        });
        // Recalculate on init too:
        recalculateHeight();

        function recalculateHeight() {
          var wnd = getWindowDimensions();
          if (wnd.width <= 760) {
            /* mobile */
            element.css({'max-height': wnd.height - ( TOOLBAR_HEIGHT + NAVBAR_HEIGHT + 100) + 'px', height: 'initial'});
          } else {
            /* desktop */
            element.css({'max-height': 'initial', height: wnd.height - (MAINCONTROLL_HEIGHT + NAVBAR_HEIGHT + TOOLBAR_HEIGHT) + 'px'});
          }

        }

        function getWindowDimensions () {
          return { width : getWidth(), height: getHeight() };
        }
        // TODO: Move to some service
        function getWidth() {
          if (self.innerHeight) {
            return self.innerWidth;
          }

          if (document.documentElement && document.documentElement.clientHeight) {
            return document.documentElement.clientWidth;
          }

          if (document.body) {
            return document.body.clientWidth;
          }
        }

        function getHeight() {
          if (self.innerHeight) {
            return self.innerHeight;
          }

          if (document.documentElement && document.documentElement.clientHeight) {
            return document.documentElement.clientHeight;
          }

          if (document.body) {
            return document.body.clientHeight;
          }
        }
        /*
        * window.onresize = function(event) {
         ...
         };
        * */
      }
    };
  });
