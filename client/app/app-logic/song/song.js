/**
 * Created by orcwarrior on 2014-11-08.
 */

(function () {
  "use strict";
  angular.module('musicBucketEngine')
    .factory('song', function (songCommons, songMetainfosConstructor, songEngineConstructor, songCatalogueInfos, songAlternatives, songControllsInterface) {

      var songDefaultConfig = {
          alternates : null
      };

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

        this.alternatives = alternates;
        var self = this;

        /* methods */
        this.getSongTypeName = function () {
          var typeObj = _.pick(songCommons.songType, function (value, key, object) {
            return value === self.type;
          });
          return _.keys(typeObj)[0];
        };
        /* called when song is preparing to play
        *  (now it means when it's added to queue */
        this.preload = function() {

          new songCatalogueInfos(this.metainfos)
            .then(function (catalogueInfos) {
              self.catalogueInfos = catalogueInfos;
              // console.log("Catalogue infos:");
              // console.log(catalogueInfos);
              if (_.isUndefined(self.alternatives))
                self.alternatives = new songAlternatives(self.metainfos, alternates, self.catalogueInfos);
            });

        }
        this.getUsedEngine = function() {
          if (!_.isUndefined(this.usedAlt)) return this.usedAlt.engine;
          else return this.engine;
        }
      };
      song.prototype = new songControllsInterface(function control() {
        var ret, dstMethod = _.last(arguments);
        /* Calling priority
         * 1. Actuallly used alternative.
         * 2. Engine object method.
         * */
        if (!_.isUndefined(this.usedAlt) && !_.isUndefined(this.usedAlt.engine))
          ret = this.usedAlt.engine[dstMethod](arguments);
        else
          ret = this.engine[dstMethod](arguments);

        /* TMP DISABLED ALTERNATIVES
        if (ret.error) {
          if (!_.isUndefined(this.alternatives)) {
            this.usedAlt = this.alternatives.getAlternative();
          } else {
            this.alternatives = new songAlternatives(this.metainfos, undefined, this.catalogueInfos);
          }
          if (_.isUndefined(this.usedAlt)) {
            this.alternatives.alternativesPromise
              .then(function(alts) {
                self.usedAlt = self.alternatives.getAlternative();
                ret = self.usedAlt[dstMethod](arguments);
              });
          } else {
            ret = this.usedAlt[dstMethod](arguments);
          }
        }
        */
        return ret.result;
      });
      return song;
    });
})();
