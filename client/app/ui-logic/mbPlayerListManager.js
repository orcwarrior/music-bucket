/**
 * Created by orcwa on 11.02.2016.
 */
'use strict';

angular.module('musicBucketApp')
  .service('mbPlayerListManager', function ($rootScope, $timeout, playlistListProvider, mbPlayerEngine) {

    var mbPlayerListManagerFunc = function mbPlayerListManager() {
      var oldList = undefined;
      const SWAP_MIDTIME = 400; //ms
      const HEADER_CLASS = "mb-player-list-header";
      const CONTAINER_CLASS = "mb-player-list-container";
      this.activeList = new playlistListProvider(mbPlayerEngine.getPlaylist());
      this.activeList.manager = this;
      this.ui = {};
      this.ui.swapper = {
        state: 'none', // start, finishing
        srcPos: {x: undefined, y: undefined},
        color: undefined,
        element: undefined
      };

      this.swapLists = function ($event, newEntry, color) {
        var self = this;
        if (!_.isUndefined($event)) {
          this.ui.swapper.state = 'start';
          this.ui.swapper.element.css('top', $event.pageY - 420);
          this.ui.swapper.element.css('left', $event.pageX);
        }
        oldList = self.activeList;
        self.activeList = {};
        $timeout(function () {
          self.activeList = newEntry;
          newEntry.manager = self;
          self.ui.swapper.state = 'finishing';
          $rootScope.$broadcast("list-container:update", newEntry);
          $timeout(function () {
            self.ui.swapper.state = 'none';
          }, SWAP_MIDTIME);
        }, SWAP_MIDTIME);

      };
      this.goBackToOldList = function ($event, color) {
        this.swapLists($event, oldList, color);
      };
      this.registerSwapperElement = function (swapper) {
        this.ui.swapper.element = swapper;
      };
      this.registerListScope = function(scope) {
        this.listScope = scope;
      }
      this.getHeaderClass = function () {
        var headerClass = "";
        if (this.ui.swapper.state === 'start')
          headerClass = 'fadeout ';
        else if (this.ui.swapper.state === 'finishing')
          headerClass = 'fadein ';

        if (!_.isUndefined(this.activeList) && !_.isUndefined(this.activeList.header) && !_.isUndefined(this.activeList.header.__customDirectiveName))
          headerClass = this.activeList.header.__customDirectiveName + headerClass;
        else
          headerClass = HEADER_CLASS + headerClass;
        return headerClass;
      };
      this.getContainerClass = function () {
        var containerClass = "";
        if (this.ui.swapper.state === 'start')
          containerClass = 'fadeout ';
        else if (this.ui.swapper.state === 'finishing')
          containerClass = 'fadein ';

        if (!_.isUndefined(this.activeList) && !_.isUndefined(this.activeList.container) && !_.isUndefined(this.activeList.container.__customDirectiveName))
          containerClass = this.activeList.container.__customDirectiveName + containerClass;
        else
          containerClass = CONTAINER_CLASS + containerClass;
        return containerClass;
      };
      return this;
    };
    return new mbPlayerListManagerFunc();
  });
