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
        this.nextOrder = nextOrder || entryCommons.nextOrder.random;
        this.entries = songs || {};
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
              song = _.values(this.entries)[0];
            } else {
              song = _.omit(this.entries, _.values(this.playedIDs));
              song = song[_.keys(song)[0]]; // doesn't look too good
            }
          } else { // random
            var nonPlayed = _.omit(this.entries, this.playedIDs);
            song = _.sample(nonPlayed);
          }
          if (_.isUndefined(options.songId)) // play song on demand don't match it as played
            this.playedIDs.push(song.id);

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
          if (!this.songsCount)
            this.songsCount = _.keys(this.entries).length;
          return this.songsCount
        };
      };

      virtualEntryFunc.prototype = new entryBase();
      virtualEntryFunc.prototype.addSong = function (song) {
        if (!_.isUndefined(this.entries[song.id])) return $log.info("There is already song with same id!");
        this.entries[song.id] = song;
        song.entryId = this.id;
        var mbPlayerEngine = $injector.get('mbPlayerEngine');
        mbPlayerEngine.getPlaylist().alter();
      };
      virtualEntryFunc.prototype.sort = function (entries) {
        var idx=0;
        if (this.nextOrder == entryCommons.nextOrder.sequence)
          return _.sortBy(entries, function (song) {
            return parseInt(song.metainfos.trackNo + "0" + idx++);
          });
        else
          return _.sortBy(entries, function (song, idx) {
            return song.metainfos.getSongDescription();
          });
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
