/**
 * Created by orcwa on 03.07.2016.
 */

angular.module('musicBucketEngine')
  .service('searchDefinition', function (searchDefinitionTypes) {
    var searchDefinitionFunc = function searchDefinition(types, data) {
      // Let types be always an array.
      return {
        type: (!_.isArray(types)) ? [types] : types,
        data: data
      };
    }
    return searchDefinitionFunc;
  }
)
;
