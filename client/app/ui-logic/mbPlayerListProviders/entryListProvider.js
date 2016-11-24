/**
 * Created by orcwa on 11.02.2016.
 */
'use strict';

angular.module('musicBucketApp')
  .service('entryListProvider', function (mbPlayerEngine, song) {

    var entryListProviderFunc = function entryListProvider(entry) {
      var self = this;
      // this.manager will be autolinked by manager
      this.header = {
        description: entry.getName(),
        actions: {
          close: function ($event, color) {
            self.manager.goBackToOldList($event, color);
          }
        }
      };
      this.container = {
        entryRef: entry,
        entries: entry.entries,
        entriesVals: _.values(entry.entries),
        menuActions: {
          play: {
            description: 'Play', icon: 'av-play-circle-fill', on: function (song) {
              mbPlayerEngine.entryPlay(self.container.entryRef, song.id);
            }
          },
          playNext: {
            description: 'Play Next', icon: 'content-redo', on: function (song) {
              mbPlayerEngine.entryPlayNext(self.container.entryRef, song.id);
            }
          },
          queue: {
            description: 'Enqueue', icon: 'action-schedule', on: function (song) {
              mbPlayerEngine.entryEnqueue(self.container.entryRef, song.id);
            }
          },
          remove: {
            description: 'Remove', icon: 'action-delete', on: function (song) {
              self.container.entryRef.removeSong(song);
              self.container.entries = self.container.entryRef.entries;
            }
          }
        },
        _customDirectiveName: undefined,
        getEntryDescription: function (entrySong) {
          //if (entrySong.__models__ && entrySong.__models__.db.base.indexOf("song") === 0) // DIIIRTY HACK :/
          if (entrySong.metainfos && entrySong.metainfos.getSongDescription)
            return entrySong.metainfos.getSongDescription();
        },
        resolve: function (song) {
          song.metainfos.resolve();
        },
        isActive: function (song) {
          var curSong = mbPlayerEngine.getCurrentSong();
          return !_.isUndefined(curSong) && curSong.id == song.id;
        },
        isBanned: function (song) {
          return song && song.isBanned(); }
      };
      return this;
    };
    return entryListProviderFunc;
  });
