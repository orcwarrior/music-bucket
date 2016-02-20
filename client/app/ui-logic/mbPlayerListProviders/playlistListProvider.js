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
        entries: playlist.entries,
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
          remove: {description: 'Remove', icon: 'action-delete', on: _.bind(playlist.removeEntry, playlist)}
        },
        _customDirectiveName: undefined,
        getEntryDescription: function (entry) {
          return entry.getName();
        },
        isActive: function(entry) { return entry.isActive(); }
      };
      return this;
    };
    return playlistListProviderFunc;
  });
