/**
 * Created by orcwarrior on 2014-11-08.
 */

(function () {
  "use strict";
  angular.module('musicBucketEngine')
    .factory('song', function (songCommons, songMetainfosConstructor, songEngineConstructor, songCatalogueInfos, songAlternatives, songControllsInterface) {

      var song = function song(response, type, myEntryId, alternates) {
        /* initialization */
        this.type = type;
        this.entryId = myEntryId; // Anti-circullar: id only
        // It's ugly :(
        if (response.metainfosAsResponse)
          this.metainfos = response;
        else
          this.metainfos = new songMetainfosConstructor(response, type);
        this.engine = new songEngineConstructor(this.metainfos, type);
        this.metainfos.getDuration();
        var self = this;

        /* methods */
        this.getSongTypeName = function () {
          var typeObj = _.pick(songCommons.songType, function (value, key, object) {
            return value === self.type;
          });
          return _.keys(typeObj)[0];
        };
      };
      song.prototype = new songControllsInterface(function controll() {
        var ret, dstMethod = _.last(arguments);
        /* Calling priority
         * 1. Actuallly used alternative.
         * 2. Engine object method.
         * */
        if (!_.isUndefined(this.usedAlt))
          ret = this.usedAlt[dstMethod](arguments);
        else
          ret = this.engine[dstMethod](arguments);

        if (ret.error) {
          this.usedAlt = this.alternatives.getAlternative();
          if (_.isUndefined(this.usedAlt)) return {error: "No working song engine or any alternative!"};
          ret = this.usedAlt[dstMethod](arguments);
        }
        return ret.result;
      });
      return song;
    });
})();
