/**
 * Created by orcwarrior on 2015-10-12.
 */
/**
 * Created by orcwarrior on 2014-12-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('virtualEntry', function ($rootScope, $q, $log, $injector, entryCommons, entryBase) {


      var virtualEntryFunc = function virtualEntry(entryName, songs, nextOrder) {
        var entryId;
        this.shortDescription = entryName;
        this.id = entryId = "VIR-" + this.shortDescription;
        this.type = entryCommons.entryType.virtalPlaylist;
        this.nextOrder = (nextOrder ? nextOrder : entryCommons.nextOrder.random);
        this.entries = songs || [];
        _.each(this.entries, function (song) {
          song.entryId = entryId;
        });
        this.playedIDs = [];

        this.getNext = function (options) {
          var deferred = $q.defer(), song, songId;
          // TODO: Move to player (on-play, store reference to currenty playlist-entry)
          if (!_.isUndefined(options.songId)) {
            song = _.find(this.entries, _.matcher({id: options.songId}));
          }
          else if (this.nextOrder === entryCommons.nextOrder.sequence) {
            var lastPlayed = _.last(this.playedIDs);
            if (_.isUndefined(lastPlayed)) {
              song = this.entries[0];
            } else {
              song = _.reduce(this.entries, function (memo, val, idx, list) {
                if (val.id === lastPlayed)
                  memo = list[idx + 1];
                return memo;
              }, undefined);
            }
            songId = song.id;
          } else {
            var allSongsIDs = _.map(this.entries, function (s) {
              return s.id;
            });
            var nonPlayed = _.difference(allSongsIDs, this.playedIDs);
            songId = _.sample(nonPlayed);
            song = _.find(this.entries, _.matcher({id: songId}));
          }
          if (_.isUndefined(options.songId)) // play song on demand don't match it as played
            this.playedIDs.push(songId);

          if (_.isFunction(song.resolve))
            song.resolve(function (resolvedSong) {
              deferred.resolve(resolvedSong);
              if (!_.isUndefined(options.playlistCallback))
                options.playlistCallback(resolvedSong);
            });
          else {
            deferred.resolve(song);
          }
          return deferred.promise;
        };
        this.getPlayedCount = function () {
          return this.playedIDs.length;
        };
        this.getSongsCount = function () {
          return this.entries.length;
        };
      };

      virtualEntryFunc.prototype = new entryBase();
      virtualEntryFunc.prototype.addSong = function (song) {
        var sameId = _.find(this.entries, function (entry) {
          return entry.id === song.id;
        });
        if (!_.isUndefined(sameId)) return $log.info("There is already song with same id!");
        this.entries.push(song);
        song.entryId = this.id;
        var mbPlayerEngine = $injector.get('mbPlayerEngine');
        mbPlayerEngine.getPlaylist().alter();
      };
      virtualEntryFunc.prototype.__models__ = {
        db: {
          base: "virtualEntry",
          constructorArgs: ['shortDescription', 'entries', 'nextOrder'],
          pickedFields: [
            'id',
            'type',
            'shortDescription',
            'nextOrder',
            'entries']
        },
        cookies: {
          base: "virtualEntry",
          constructorArgs: ['shortDescription', 'entries', 'nextOrder'],
          pickedFields: [
            'id',
            'type',
            'shortDescription',
            'entries',
            'nextOrder',
            'playedIDs'
          ]
        }
      };
      return virtualEntryFunc;
    });
})();
