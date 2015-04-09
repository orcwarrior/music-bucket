/**
 * Created by orcwarrior on 2014-12-05.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('queueEntry', function (SMSoundConverter, $log, songCatalogueInfos, songAlternatives) {
      return function queueEntry(song) {
        this.song = song;

        function initCatalougeInfos() {
          if (!_.isUndefined(song.catalogueInfos)) return;

          new songCatalogueInfos(song.metainfos)
            .then(function (catalogueInfos) {
              song.catalogueInfos = catalogueInfos;
              // console.log("Catalogue infos:");
              // console.log(catalogueInfos);
              if (_.isUndefined(song.alternatives))
              song.alternatives = new songAlternatives(song.catalogueInfos);
            });
        } initCatalougeInfos();
      };
    }
  );
})();
