/**
 * Created by orcwarrior on 2015-03-23.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosYoutube', function (songMetainfos, youtubeApi) {

      var songMetainfosYoutube = function songMetainfosYoutube(providedInfos) {
        if (_.isObject(providedInfos)) {
          var combTitle = providedInfos.snippet.title;
          this.id = providedInfos.id.videoId;
          this.artist = combTitle.split(' -')[0].trim();
          if (combTitle.split(' -')[1])
            this.title = combTitle.split(' -')[1].trim();
        } else {
          this.id = providedInfos;
        }
        this.albumArt = "http://img.youtube.com/vi/"+this.id+"/hqdefault.jpg";
        this.url = "http://youtube.com/?watch=" + this.id;
        this.getUrl = function () { return this.url; };
        this.metainfosAsResponse = true;
      };
      songMetainfosYoutube.prototype = new songMetainfos();

      songMetainfosYoutube.prototype.extractArtistAndTitle = function(videoTitle) {
        var res = {artist:'', title:''};
        var split = videoTitle.split(' -');
        if (split.length === 1) {// man w/e
          split = videoTitle.split(' ');
          split = [split[0], videoTitle.substr(split[0].length+1)]
        } else
          split[1] = videoTitle.substr(split[0].length+3);
        res.artist = split[0].trim();
        res.title = split[1].trim();
        return res;
      };
      songMetainfosYoutube.prototype.isResolved = function() {
        return !((_.isUndefined(this.artist) || this.artist === "") && (_.isUndefined(this.title) || this.title === ""));
      };
      songMetainfosYoutube.prototype.resolve = function() {
        var self = this;
        if (!this.isResolved()) {
          youtubeApi.video.get(this.id)
            .then(function(response) {
              var snippet = response.data.items[0].snippet;
              var info = self.extractArtistAndTitle(snippet.title);
              _.extendOwn(self, info);
            });
        }
      };
      songMetainfosYoutube.prototype.__models__ = {
        db: {
          base: "songMetainfosYoutube",
          pickedFields: [
            'id',
            'artist',
            'album',
            'title',
            'url',
            'metainfosAsResponse']
        },
        cookies: {
          base: "songMetainfosYoutube",
          pickedFields: [
            'id',
            'artist',
            'album',
            'title',
            'url',
            'metainfosAsResponse']
        }
      };
      return songMetainfosYoutube;
    });
})();
