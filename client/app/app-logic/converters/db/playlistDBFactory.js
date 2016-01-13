/**
 * Created by orcwarrior on 2015-01-15.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('playlistDBFactory', function (playlist, playlistEntryDBFactory, modelConverter) {

      var fromDBModel = function (_playlist, db) {
        _playlist.id = db._id;
        _playlist.author = db.author;
        _playlist.authorName = db.authorName;
        _playlist.name = db.name;
        _playlist.songsCount = db.songsCount;
        _playlist.sampleSongs = db.sampleSongs;
        _playlist.visibility = db.visibility || "public";
        _playlist.tags = db.tags || [];
        _playlist.imageUrl = db.imageUrl;
        _playlist.modified = db.modified;
        _playlist.description = db.description;
        _playlist.entries = _.map(db.entries,
          function (entry) {
            return playlistEntryDBFactory.convertFrom(entry);
          });
      }
      var toDBModel = function (_playlist) {
        return {
          songsCount: _playlist.songsCount,
          name: _playlist.name,
          entries: _.map(_playlist.entries, function (entry) {
            return playlistEntryDBFactory.convertTo(entry);
          }),
          sampleSongs: _playlist.sampleSongs,
          visibility: _playlist.visibility,
          tags: _playlist.tags,
          imageUrl: _playlist.imageUrl,
          modified: _playlist.modified,
          description: _playlist.description
        };
      };

      return {
        convertFrom: function (dbModel) {
          // dbModel._base = dbModel._base || "playlist";
          var recoveredPlaylist = modelConverter.convertFromModel(dbModel, 'db');
          // continious integration with old version (-_-)
          if (!(recoveredPlaylist instanceof playlist)) {
            recoveredPlaylist = new playlist();
            fromDBModel(recoveredPlaylist, dbModel);
          }
          return recoveredPlaylist;
        },
        convertTo: function (playlist) {
          return modelConverter.convertToModel(playlist, 'db');
        }
      };
    });
})();
