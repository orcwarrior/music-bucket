'use strict';

angular.module('musicBucketApp')
  .service('mbPlayerToolbarsConfigurer', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var registry = {
      "mbPlayerToolbarWrapperTop": ["mbPlayerToolItemClearPlaylist", "mbPlayerToolItemSavePlaylist", "mbPlayerToolItemClearPlaylistPlayed", "mbPlayerToolItemPlayOrder", "mbPlayerToolItemVolume"]
    };

    return function mbPlayerToolbarsConfigurer() {
      var WRAPPER_PREFIX = "mbPlayerToolbarWrapper",
        TOOLITEM_PREFIX = "mbPlayerToolItem";
      this.registerToolItem = function (toolItemName, toolbarWrapperName) {
        if (_.isUndefined(registry[toolbarWrapperName])) registry[toolbarWrapperName] = [toolItemName];
        else registry[toolbarWrapperName].push(toolItemName);
      };
      this.unregisterToolItem = function (toolItemName, toolbarWrapperName) {
        if (_.isUndefined(registry[toolbarWrapperName])) return;
        else registry[toolbarWrapperName] = _.without(registry[toolbarWrapperName], toolItemName);
      };
      this.getRegisteredToolItems = function (toolbarWrapperName) {
        if (_.isUndefined(registry[toolbarWrapperName])) return [];
        else return registry[toolbarWrapperName];
      }
      this.getRegisteredToolItemsAsTags = function (toolbarWrapperName) {
        return _.map(this.getRegisteredToolItems(toolbarWrapperName),
          function (ngName) {
            return s.slugify(ngName.replace(/([A-Z])/g, " $1"));
          });
      }
    };
    return this;
  });
