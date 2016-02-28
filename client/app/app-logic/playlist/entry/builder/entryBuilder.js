/**
 * Created by orcwa on 22.02.2016.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('entryBuilder', function ($q) {
      var cachedEntries = {};
      var entryBuilderFunc = function entryBuilder() {
      };

      entryBuilderFunc.prototype.store = function (entry) {
        var deffered = $q.defer();
        var buildedObj;
        if (cachedEntries[entry.id])
          buildedObj = cachedEntries[entry.id];
        else
          buildedObj = this.build(entry.__builder__.data);

        $q.when(buildedObj, function (obj) {
          cachedEntries[entry.id] = obj;
          var diff = _.deepObjDiff(obj, entry, function (val, key) {
            return _.isFunction(val) || _.isUndefined(val) || key === '$$hashKey' || key === 'listeners';
          });
          deffered.resolve(diff || {});
        });
        return deffered.promise;
      };
      return new entryBuilderFunc();
    });
})();
