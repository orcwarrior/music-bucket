/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosSoundcloud', function (songMetainfos, soundcloudApi) {
      var songMetainfosSoundcloud = function songMetainfosSoundcloud(src) {
        this.type = "audio/mp3";
        if (_.isNull(src)) return;

        this.id = "SC-" + src.id;

        var splitedTitle = src.title.split('-');
        if (splitedTitle.length === 2) { // there is an dash:
          this.artist = splitedTitle[0].trim();
          this.title = splitedTitle[1].trim();
        } else if (splitedTitle.length === 1) {
          this.title = src.title;
          this.artist = src.user.username;
        } else {
          this.title = src.title;
        }
        if (!_.isNull(src.artwork_url))
          this.albumArt = src.artwork_url.replace('large.jpg', 'crop.jpg');
        this.genere = src.genre;
        this.url = soundcloudApi.track.streamUrl(src.id);
      };
      songMetainfosSoundcloud.prototype = new songMetainfos();
      return songMetainfosSoundcloud;

    });
})();
