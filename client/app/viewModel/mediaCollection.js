/**
 * Created by orcwa on 26.06.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaCollection', function ($q, pageObject) {
    /* private */
    function _initMediaCollectionBySearchService(mediaCollection) {
      mediaCollection.title = mediaCollection.searchService.searchName;
      mediaCollection.subtitle = mediaCollection.searchService.searchSubName;
    }

    var fetchedDataSingleFunc = function fetchedDataSingle(startItem, endItem, data) {
      this.startItem = startItem;
      this.endItem = endItem;
      this.data = data;
      return this;
    };
    var mediaCollectionFunc = function mediaCollection(searchService, searchDefinition, pageObjectConfig) {
      var self = this;
      this._isWorking = false;
      this.searchService = searchService;
      this.searchDefinition = searchDefinition;
      this.pageObject = new pageObject(pageObjectConfig);
      this.search = function () {
        return this.pageObject.fetchData(this);
      };
      _initMediaCollectionBySearchService(this);
      return this;
    };

    return mediaCollectionFunc;
  });
