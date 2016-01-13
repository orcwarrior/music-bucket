/**
 * Created by orcwarrior on 2014-11-24.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('repeatOnePlaylistSequencer', function ($injector, $q) {
      var hlp = {
        lastPlayedEntry: null,
        lastPlayedIdx: null
      };
      var engine;
      var setupDone = false;

      function init() {
        engine = $injector.get("mbPlayerEngine");
      }

      return {
        name: 'repeatOne',
        iconClass: 'mdi-av-replay',
        setup: function () {
          init();
          var song = engine.getCurrentSong();
          if (!_.isUndefined(song))
            engine.queue.enqueueNext(engine.getCurrentSong());
          setupDone = true;
        },
        unset: function () {
          init();
          var song = engine.getCurrentSong();
          if (!_.isUndefined(song))
            engine.queue.removeBySongId(song.metainfos.id);
        },
        songChange : function() {
          this.setup(); // queue same song again
        },
        getNext: function (playlistEntries, entriesCount, options) {
          if (!setupDone) this.setup();
          // get next entry:
          var defered = $q.defer();
          var song;
          song = engine.getCurrentSong();

          if (_.isUndefined(song))
            return playlistEntries[0].getNext(options);
          else {
            defered.resolve(song);
            return defered.promise;
          }
        }

      };
    })
})();
