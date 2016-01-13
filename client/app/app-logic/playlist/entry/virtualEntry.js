/**
 * Created by orcwarrior on 2015-10-12.
 */
/**
 * Created by orcwarrior on 2014-12-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('virtualEntry', function ($rootScope, $q, entryCommons, entryBase) {


      var virtualEntryFunc = function virtualEntry(entryName, songs, nextOrder) {
        var entryId;
        this.shortDescription = entryName;
        this.id = entryId = "VIR-" + this.shortDescription;
        this.type = entryCommons.entryType.virtalPlaylist;
        this.nextOrder = (nextOrder ? nextOrder : entryCommons.nextOrder.random);
        this.entries = songs || [];
        _.each(this.entries, function(song) {song.entryId = entryId; });
        this.nonPlayedSongs = _.map(this.entries, function(e) {return e.id; });

        this.getNext = function (options) {
          var deferred = $q.defer(), song, songId;
          // TODO: Move to player (on-play, store reference to currenty playlist-entry)
          if (this.nextOrder === entryCommons.nextOrder.sequence) {
            songId = this.nonPlayedSongs.shift();
            song = _.find(this.entries, _.matcher({id : songId}));
          } else {
            songId = _.sample(this.nonPlayedSongs);
            song = _.find(this.entries, _.matcher({id : songId}));
            this.nonPlayedSongs = _.without(this.nonPlayedSongs, songId);
          }
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
          return this.getSongsCount() - this.nonPlayedSongs.length;
        };
        this.getSongsCount = function () {
          return this.entries.length;
        };
      };

      virtualEntryFunc.prototype = new entryBase();
      virtualEntryFunc.prototype.addSong = function(song) {
        this.entries.push(song);
        this.nonPlayedSongs.push(song.id);
        song.entryId = this.id;
      };
      virtualEntryFunc.prototype.__models__ = {
        db: {
          base: "virtualEntry",
          constructorArgs : ['shortDescription', 'entries', 'nextOrder'],
          pickedFields: [
            'id',
            'type',
            'shortDescription',
            'nextOrder',
            'entries']
        },
        cookies: {
          base: "virtualEntry",
          constructorArgs : ['shortDescription', 'entries', 'nextOrder'],
          pickedFields: [
            'id',
            'type',
            'shortDescription',
            'entries',
            'nextOrder',
            'playedCount',
            'nonPlayedSongs'
          ]
        }
      };
      return virtualEntryFunc;
    });
})();
