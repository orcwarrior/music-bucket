/**
 * Created by orcwa on 11.02.2016.
 */
'use strict';

angular.module('musicBucketApp')
  .service('playlistListProvider', function (mbPlayerEngine, entryListProvider) {

    var playlistListProviderFunc = function playlistListProvider(playlist) {
      var self = this;
      // this.manager will be autolinked by manager
      this.header = undefined; // no header right now.
      this.container = {
        entryRef: playlist,
        entries: playlist.entries,
        entriesVals: _.values(playlist.entries),
        actions: {
          dblclick: function ($event, listEntry) {
            self.manager.swapLists($event, new entryListProvider(listEntry));
          },
          click: undefined
        },
        menuActions: {
          play: {description: 'Play', icon: 'av-play-circle-fill', on: mbPlayerEngine.entryPlay},
          playNext: {description: 'Play Next', icon: 'content-redo', on: mbPlayerEngine.entryPlayNext},
          queue: {description: 'Enqueue', icon: 'action-schedule', on: mbPlayerEngine.entryEnqueue},
          remove: {description: 'Remove', icon: 'action-delete', on: null}
        },
        _customDirectiveName: undefined,
        getEntryDescription: function (entry) {
          if (entry.getName)
            return entry.getName();
        },
        isActive: function (entry) {
          if (entry.isActive)
            return entry.isActive();
        },
        isBanned: function () { return false; }
      };
      this.container.menuActions.remove.on = function(entry) {
        // FIX: ALWAYS RE-EVALUATE PLAYLIST
        _.bind(self.container.entryRef.removeEntry, self.container.entryRef, entry)();
      }
      return this;
    };
    return playlistListProviderFunc;
  });
