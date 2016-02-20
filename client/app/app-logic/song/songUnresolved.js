/**
 * Created by orcwarrior on 2015-02-26.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songUnresolved', function (songControllsInterface, songMetainfosConstructor, songCommons, songSeeker, songMetainfos, hashGenerator) {

      var defaultResolveFunction = function (initData, resolveCb) {
        var self = this;
        new songSeeker(initData, true)
          .then(function (song) {
            song.id = self.id;
            song.entryId = self.entryId; // rewrite old entryId;
            self = song;
            //_.extendOwn(self, song);
            self.resolve = undefined;
            if (!_.isUndefined(resolveCb))
              resolveCb(self);
          });
      };

      var songUnresolved = function songUnresolved (initData, resolveFunction, entryId) {
        this.id = hashGenerator.generateId();
        this.resolveFunction = resolveFunction;
        this.initData = initData;
        this.resolve = _.bind(this.resolveFunction || defaultResolveFunction, this, initData || this.initData);
        this.entryId = entryId;
        this.type = songCommons.songType.unresolved;

        if (initData instanceof songMetainfos)
          this.metainfos = initData;
        else  //getSongDescription
          this.metainfos = new songMetainfosConstructor(initData, this.type);
      }
      songUnresolved.prototype = new songControllsInterface(function () {
        if (this.type === songCommons.songType.unresolved) {
          console.log("songUnresolved controlls called !!!");
          console.log(_.last(arguments));
          this.resolve();
        } else {

        }
      });
      songUnresolved.prototype.__models__ = {
        db: {
          base: "songUnresolved",
          constructorArgs : ['initData', 'resolveFunction', 'entryId'],
          pickedFields: [
            'id',
            'resolveFunction',
            'entryId',
            'type',
            'initData']
        },
        cookies: {
          base: "songUnresolved",
          constructorArgs : ['initData', 'resolveFunction', 'entryId'],
          pickedFields: [
            'id',
            'resolveFunction',
            'entryId',
            'type',
            'initData']
        }
      };

      return songUnresolved;
    });
})();
