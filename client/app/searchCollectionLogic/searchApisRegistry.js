'use strict';

angular.module('musicBucketEngine')
  .service('searchApisRegistry', function (mediaCollection, searchService) {


    function searchServiceFilters(config) {
      this.omitedServices = [];
      this.omitedSearchDefinitionTypes = [];
      this.filterService = function (service) {
        return !_.contains(this.omitedServices, service.id);
      };
      this.filterByDefinition = function (searchDefinition, searchServices) {
        return _.filter(searchServices, function (service) {
          return _.contains(searchDefinition.type, service.searchTypeMatching);
        });
      };
      return _.extend(this, config);
    }

    var searchApisRegistry = {
      filter: new searchServiceFilters(),
      searchServices: {},
      registerSearchService: function (srvcId, srvcMethod, srvcSearchTypes, srvcSearchSrcKey) {
        var constructedService = new searchService(srvcId, srvcMethod, srvcSearchTypes, srvcSearchSrcKey);
        if (constructedService) {
          console.log("Added " + constructedService.id + " to search services!");
          this.searchServices[constructedService.id] = constructedService;
        }
      },
      search: function (searchDefinition) {
        var matchedSearchServices = this.filter.filterByDefinition(searchDefinition, this.searchServices);

        return _.map(matchedSearchServices, function (srchService) {
          var collection = new mediaCollection(srchService, searchDefinition);
          collection.search();
          return collection;
        });
      }
    };

    return searchApisRegistry;
  })
;
