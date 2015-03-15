'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerToolbarWrapperTop', function ($compile, $log, mbPlayerToolbarsConfigurer) {
    return {
      templateUrl: 'app/mbPlayerToolbars/mbPlayerToolbarWrapperTop/mbPlayerToolbarWrapperTop.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        function buildToolItems(toolitems) {
          return _.map(toolitems, function (atrName) {
            $log.info("Toolbar-top: added: " + atrName);
            var item = $compile("<" + atrName + "/>")(scope);
            element.append(item);
          }, "");
        };
        var toolbarConfigurer = new mbPlayerToolbarsConfigurer();
        buildToolItems(toolbarConfigurer.getRegisteredToolItemsAsTags("mbPlayerToolbarWrapperTop"));
        element.addClass("toolbar-wrapper-top");
      }
    };
  });
