/**
 * Created by orcwa on 11.02.2016.
 */
'use strict';

angular.module('musicBucketApp')
  .service('entryListProvider', function (mbPlayerEngine) {

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
        getEntryDescription: function (song) {
          return song.metainfos.getSongDescription();
        },
        resolve: function (song) {
          song.metainfos.resolve();
        },
        isActive: function (song) {
          var curSong = mbPlayerEngine.getCurrentSong();
          return !_.isUndefined(curSong) && curSong.id == song.id;
        }
      };
      return this;
    };
    return entryListProviderFunc;
  });
