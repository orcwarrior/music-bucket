/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosSongza', function (songMetainfos) {
      var songMetainfosSongza = function songMetainfosSongza(src) {
        this.id = "SNGZ-"+src.song.id;
        this.artist = src.song.artist.name;
        this.title = src.song.title;
        this.album = src.song.album;
        this.albumArt = src.song.cover_url.replace('a.jpeg', 'g.jpeg');
        this.genere = src.song.genre;
        this.url = src.listen_url;
        this.getUrl = function () { return this.url;};
      }
      songMetainfosSongza.prototype = new songMetainfos();
      return songMetainfosSongza;

    });
})();
