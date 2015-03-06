/**
 * Created by orcwarrior on 2015-03-02.
 */
/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songCatalogueInfos', function ($q) {
      return function (metainfos) {
        var deferred = $q.defer();
        deferred.resolve({});
        return deferred.promise;
      };

    })
})();
