/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songEngineConstructor', function (songCommons, songEngineYoutube, songEngineSM2) {

      return function (metainfos, type) {
        var engine;
        switch (type) {
          case (songCommons.songType.youtube):
            engine = new songEngineYoutube(metainfos);
            break;
          default:
            engine = new songEngineSM2(metainfos);
            break;
        }
        // inject get duration method to metainfos
        metainfos.getDuration = function () {
          var dur = _.bind(engine.getDuration, engine)();
          if (dur.error || _.isUndefined(dur.result) || dur.result == null) return -1;
          else return dur.result;
        };
        return engine;
      };

    });
})();
