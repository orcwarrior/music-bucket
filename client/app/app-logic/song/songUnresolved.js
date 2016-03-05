/**
 * Created by orcwarrior on 2015-02-26.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songUnresolved', function (songControllsInterface, songMetainfosConstructor, songCommons, songSeeker, songMetainfos, hashGenerator) {


      function filterMetainfos(metainfos) {
        var filteredMeta = {};
        _.each(_.pick(metainfos, 'album', 'artist', 'title', 'albumArt', 'genere', 'trackNo'), function (val, key) {
          if (!_.isUndefined(val)) filteredMeta[key] = val;
        });
        return filteredMeta;
      };

      function processFoundedSong(song, prepMetainfos) {
        song.metainfos = _.extend(song.metainfos,
          filterMetainfos(prepMetainfos));
        if (prepMetainfos.artist && prepMetainfos.title)
          song.metainfos.__overwritenByPreparedMetainfos = true;
        return song;
      }

      var defaultResolveFunction = function (initData, resolveCb) {
        var self = this;
        new songSeeker(initData, true)
          .then(function (song) {
            song.id = self.id;
            song.entryId = self.entryId; // rewrite old entryId;
            self.resolve = undefined;
            processFoundedSong(song, self.metainfos);
            self = song;
            if (!_.isUndefined(resolveCb))
              resolveCb(self);
          });
      };

      function getSongId(initData) {
        return s.dasherize((initData.trackNo || "") + (initData.artist || "") + (initData.album || "") + (initData.title || ""));
      }

      var songUnresolved = function songUnresolved(initData, resolveFunction, entryId) {
        this.id = getSongId(initData);
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

      songUnresolved.prototype.delete = function () {
        this.state = songCommons.songState.deleted;
      };
      songUnresolved.prototype.isDeleted = function () {
        return this.state == songCommons.songState.deleted;
      }
      songUnresolved.prototype.__models__ = {
        db: {
          base: "songUnresolved",
          constructorArgs: ['initData', 'resolveFunction', 'entryId'],
          pickedFields: [
            'id',
            'resolveFunction',
            'entryId',
            'type',
            'initData']
        },
        cookies: {
          base: "songUnresolved",
          constructorArgs: ['initData', 'resolveFunction', 'entryId'],
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
