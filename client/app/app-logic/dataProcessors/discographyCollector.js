/**
 * Created by orcwa on 25.10.2015.
 */
angular.module("musicBucketEngine")
  .service("discographyCollector", function (lastFmApi, musicbrainzApi, $log, $q, moment, mbStringUtils) {
    /* middle objects */
    var eAlbumDataTypes = {
      musicbrainz: "typeMB",
      lastFm: "typeLastFm",
      merged: "typeMerged"
    };

    function discographyCollectorBase() {
      var self = this;

      this.getBasicInfos = function () {
        return _.pick(this, 'isWorking', 'name', 'albumArt', 'releaseDate');
      };
      this.getInfos = function () {
        var deffered = $q.defer();
        var infos = this.getBasicInfos();
        infos.type = this.type;
        infos.artist = this.__artistName;
        this.isWorking = true;
        // 1. Last.fm fetch
        if (_.isUndefined(this.tracks) && this.__artistName && !this.__triedLastFmFetch)
          _.bind(__lastFmTracksFetch, this, deffered, infos)();
        // 2. MB fetch
        else if (_.isUndefined(this.tracks) && this.mbid && !this.__triedMbFetch)
          _.bind(__mbTracksFetch, this, deffered, infos)();
        else {
          infos.tracks = this.tracks;
          deffered.resolve(infos);
        }

        return deffered.promise;
      };

      function __lastFmTracksFetch(deffered, infos) {
        var self = this;
        lastFmApi.album.getInfo(this.__artistName, this.name, this.mbid, undefined, true)
          .then(function (response) {
            var tracks = response.data.album.tracks.track;
            self.tracks = [];
            _.each(tracks, function (track, idx) {
              self.tracks.push(new lastFmTrack(track, idx));
            });
            //self.isWorking = false;
            self.__triedLastFmFetch = true;

            if (self.tracks.length === 0) {
              self.tracks = undefined;
              return _.bind(self.getInfos, self)();
            }
            infos.tracks = self.tracks;
            deffered.resolve(infos);
          });
      }

      function __mbTracksFetch(deffered, infos) {
        var self = this;
        $log.info("Calling for MB Release: ");
        musicbrainzApi.get.release(this.mbid)
          .then(function (response) {
            $log.info("Called for MB release, response:");
            $log.info(response.data);
          })
      }
    }

    /* lastFm*/
    function lastFmTrack(track, idx) {
      this.name = track.name;
      this.mbid = undefined;
      this.duration = track.duration * 1000; // in ms
      this.durationView = Math.floor(this.duration / 60000) + ":" + s.pad(Math.floor((this.duration % 60000)/10000), 2, '0')
      this.index = idx;
    };

    var discographyCollectorAlbumLastfm = function discographyCollectorAlbumLastfm(lastFmAlbum, artistName) {
      var artPromise = $q.defer();

      this.__artistName = artistName;
      this.dataType = eAlbumDataTypes.lastFm;
      this.isWorking = false;
      this.name = lastFmAlbum.name;
      this.playcount = lastFmAlbum.playcount;
      this.mbid = lastFmAlbum.mbid;
      this.albumArt = (lastFmAlbum && lastFmAlbum.image && lastFmAlbum.image[3]) ?
        lastFmAlbum.image[3]['#text'] : undefined;
      this.albumArtThumb = (lastFmAlbum && lastFmAlbum.image && lastFmAlbum.image[3]) ?
        lastFmAlbum.image[2]['#text'] : undefined;

      this.releaseDate = undefined;
      this.tracks = undefined;

      this.getAlbumArt = function () {
        return (this.albumArt !== "") ? this.albumArt : undefined;
      };
    };
    discographyCollectorAlbumLastfm.prototype = new discographyCollectorBase();

    /* MB */
    function mbTrack(track) {
      this.name = track.title;
      this.mbid = track.id;
      this.duration = track.length; // in ms
      this.durationView = Math.floor(this.duration / 60000) + ":" + s.pad(Math.floor((this.duration % 60000)/10000), 2, '0')
      this.index = track.number;
    };

    var discographyCollectorAlbumMb = function discographyCollectorAlbumMb(mbAlbum, artistName) {
      var artPromise = $q.defer();
      var self = this;
      this.dataType = eAlbumDataTypes.musicbrainz;
      this.isWorking = false;
      this.name = mbAlbum.title;
      this.type = mbAlbum['release-group']['primary-type'];

      this.__artistName = artistName;
      // Set date and fix it for any more-precised dates to be overwritten eventually:
      if (!_.isUndefined(mbAlbum.date)) {
        this.releaseDate = moment(mbAlbum.date);
        if (mbAlbum.date.length == 4)
          this.releaseDate.endOf("year");
      }
      ;

      this.mbid = mbAlbum.id;
      this.albumArt = undefined;

      // NOTE: Set "CD"
      if (!_.isUndefined(mbAlbum.media[0]))
        this.tracks = _.map(mbAlbum.media[0].tracks, function (track) {
          return new mbTrack(track);
        });
      this.playcount = undefined;


      this.getAlbumArt = function () {
        if (_.isUndefined(this.albumArt)) {
          musicbrainzApi.coverArt.get(this.mbid)
            .then(function (response) {
              // TODO: Check for actual idx and thumbnail availability
              self.albumArt = response.data.images[0].thumbnails.large;
              self.albumArtThumb = response.data.images[0].thumbnails.small;
              artPromise.resolve(this.albumArt);
            });
          return artPromise;
        }
        else return (this.albumArt !== "") ? this.albumArt : undefined;
      }
    };
    discographyCollectorAlbumMb.prototype = new discographyCollectorBase();

    /* Merged */
    var discographyCollectorAlbumWiseMerged = function discographyCollectorAlbumWiseMerged(albumA, albumB) {
      this.dataType = eAlbumDataTypes.merged;

      this.playcount = (!_.isUndefined(albumA.playcount) ? albumA.playcount : 0);
      this.playcount += (!_.isUndefined(albumB.playcount) ? albumB.playcount : 0);

      this.name = albumA.name;
      this.mbid = albumA.mbid;
      this.releaseDate = albumA.releaseDate;
      this.albumArt = albumA.albumArt;
      this.tracks = _.clone(albumA.tracks);
      this.type = albumA.type;
      this.__artistName = albumA.__artistName;
      this.__merges = (albumA.__merges || 0) + (albumB.__merges || 0) + 1;

      this.normalizedName = albumA.normalizedName;
      this.getInfos = albumA.getInfos;
      this.getAlbumArt = albumA.getAlbumArt;

      if (albumA.dataType != eAlbumDataTypes.musicbrainz && (albumB.dataType === eAlbumDataTypes.musicbrainz || albumB.dataType === eAlbumDataTypes.merged)) {
        this.name = albumB.name;
      }
      if ((_.isUndefined(albumA.tracks) && !_.isUndefined(albumB.tracks)) || (!_.isUndefined(albumB.tracks) && albumA.tracks.length < albumB.tracks.length)) {
        this.tracks = _.clone(albumB.tracks);
        this.getInfos = albumB.getInfos;
      }

      if (_.isUndefined(this.type))
        this.type = albumB.type;
      if (_.isUndefined(this.mbid))
        this.mbid = albumB.mbid;
      // always use earlier release date
      if (!_.isUndefined(albumB.releaseDate) && albumB.releaseDate.isBefore(albumA.releaseDate))
        this.releaseDate = albumB.releaseDate;
      if (albumA.dataType === eAlbumDataTypes.musicbrainz ||
        (!_.isUndefined(albumB.albumArt) && albumB.albumArt !== "")) {
        this.albumArt = albumB.albumArt;
        this.getAlbumArt = albumB.getAlbumArt;
      }
      return this;

    };
    discographyCollectorAlbumWiseMerged.prototype = new discographyCollectorBase();


    /* privates */
    function __processLastFmTopAlbumsResponse(data) {
      return data;
    }

    function __createBaseEntries(conf, artistName) {
      var lastFmLimit = 50;
      conf.out.albums = [];
      _.each(_.first(conf.inLastFm, lastFmLimit), function (album) {
        conf.out.albums.push(new discographyCollectorAlbumLastfm(album, artistName));
      });
      _.each(conf.inMb, function (album) {
        conf.out.albums.push(new discographyCollectorAlbumMb(album, artistName));
      });
    }

    function __mergeByMbid(out) {
      var pre = out.albums.length;
      _.each(out.albums, function (album, idx) {
        if (_.isUndefined(album))
          return; // this happens cause we mutate array during each iteration
        if (_.isUndefined(album.mbid)) return;

        var otherAlbum = _.findWhere(_.without(out.albums, album), {mbid: album.mbid});
        if (!_.isUndefined(otherAlbum)) {
          var lastFmAlbum, mbAlbum;
          lastFmAlbum = (album.dataType === eAlbumDataTypes.lastFm) ? album : otherAlbum;
          mbAlbum = (album.dataType === eAlbumDataTypes.musicbrainz) ? album : otherAlbum;
          out.albums[idx] = new discographyCollectorAlbumWiseMerged(lastFmAlbum, mbAlbum);
          out.albums.splice(out.albums.indexOf(otherAlbum), 1);
        }
      });
      $log.info("Mbid reduction: " + pre + " -> " + out.albums.length);
      return out;
    }

    function __normalizeName(album) {
      album.normalizedName = mbStringUtils.normalizeAlbumNameString(album.name);
      return album;
    }

    function __mergeByName(out) {
      // 1. Normalize album.name
      _.each(out.albums, function (album) {
        __normalizeName(album);
      });

      // 2. Find closest
      var closestMap = {};
      _.each(out.albums, function (album, idx) {
        closestMap[idx] = {idx: -1, l: Infinity};
        _.each(out.albums, function (othAlbum, oIdx) {
          if (album !== othAlbum && !_.isUndefined(album) && !_.isUndefined(othAlbum)) {
            var levenstein = s.levenshtein(album.normalizedName, othAlbum.normalizedName);
            if (levenstein < closestMap[idx].l || levenstein === 0) {
              closestMap[idx] = {idx: oIdx, l: levenstein};
              if (levenstein === 0) {
                out.albums[idx] = new discographyCollectorAlbumWiseMerged(out.albums[idx], out.albums[oIdx]);
                out.albums[oIdx] = undefined;
              }
            }
          }
        }); // each otherAlbum
        // merge if levenstein level is smaller than one plus one for each 10 letters...
        if (!_.isUndefined(album))
          if (0 < closestMap[idx].l && closestMap[idx].l < album.name.length / 10 + 1) {
            var oIdx = closestMap[idx].idx;
            out.albums[idx] = new discographyCollectorAlbumWiseMerged(album, out.albums[oIdx]);
            out.albums[oIdx] = undefined;
          }

      }); // each album

      // Filter-out 'undefined' entries:
      var len = out.albums.length;
      out.albums = _.filter(out.albums, function (album) {
        return !_.isUndefined(album);
      });
      $log.info("Name reduction : " + len + " -> " + out.albums.length);
    }

    function __sortAlbums(out) {
      out.albums = _.sortBy(out.albums, function (album) {
        // TODO: Some EP/LP/Single recognition
        var power;
        if (album.type === "Album") power = 5;
        if (album.type === "Ep") power = 2;
        if (album.type === "Single") power = 1;
        if (album.type === "Compilation") power = 2;
        if (album.type === "Soundtrack") power = 2;
        else power = 1;
        return -album.playcount * power;// * ((album.tracks) ? album.tracks.length : 1) * 2;
      });
    }

    var lastPlayingTrack;

    function __lookForPlayingSong(song, out) {
      if (_.isUndefined(song)) return;

      var album = out.getAlbumByName(song.metainfos.album);
      var normalizedName = mbStringUtils.normalizeAlbumNameString(song.metainfos.title);
      if (!_.isUndefined(album)) {
        album.getInfos()
          .then(function (album) {
            var playingTrack = _.find(album.tracks, function (track) {
              return mbStringUtils.normalizeAlbumNameString(track) == normalizedName;
            });
            if (!_.isUndefined(lastPlayingTrack)) lastPlayingTrack.isPlaying = undefined;
            lastPlayingTrack = playingTrack;
            if (!_.isUndefined(lastPlayingTrack)) lastPlayingTrack.isPlaying = true;
          });
      }

    }

    function __attachListeners(out) {
      return out;
    }

    function __processData(conf, artistName) {
      __createBaseEntries(conf, artistName);
      __mergeByMbid(conf.out);
      __mergeByName(conf.out);
      __sortAlbums(conf.out);
      __attachListeners(conf.out);
      return conf.out;
    }


    /* CONSTRUCTOR */
    /* return public method */
    return function discographyCollector(artistName, artistMbid, onReadyCb) {
      var discographyObject = {
        artist: {name: artistName, mbid: artistMbid},
        buildInProgress: true,

        // Helper functions:
        getAlbumByName: function (name) {
          var normalizedName = mbStringUtils.normalizeAlbumNameString(name);
          return _.find(this.albums, function (album) {
            return (album.name === name || album.normalizedName === normalizedName);
          });
        }
      };
      var promises = [];
      var lastFmResponse, mbResponse;
      var lastFmPromise, mbPromise;
      var flow = new Flow;
      mbResponse = [];
      lastFmPromise = lastFmApi.artist.getTopAlbums(artistName, artistMbid)
        .then(function (response) {
          if (response.status == 200 && response.data.topalbums)
            lastFmResponse = __processLastFmTopAlbumsResponse(response.data.topalbums.album);
          $log.info("discographyCollector: Last.fm albums: " + lastFmResponse.length);
        }, function (errorResponse) {
          console.warn(errorResponse);
          discographyObject.err = errorResponse.data;
        });
      promises.push(lastFmPromise);

      if (artistMbid) {
        mbPromise = musicbrainzApi.search.release({getParams: {artist: artistMbid}}, 100, 0, ['recordings', 'release-groups'])
          .then(function (response) {
            mbResponse = response.data.releases;
            $log.info("discographyCollector: MB albums: " + mbResponse['release-count']);

            // Is there more?
            if (response.data.releases.length === 100) {
              mbPromise = musicbrainzApi.search.release({getParams: {artist: artistMbid}}, 100, 100, ['recordings', 'release-groups'])
                .then(function (response) {
                  mbResponse = mbResponse.concat(response.data.releases);
                  $log.info("discographyCollector: MB albums: " + mbResponse['release-count']);
                }, function (errorResponse) {
                  console.warn(errorResponse);
                  discographyObject.err = errorResponse.data;
                });
              promises.push(mbPromise);
            }
          }, function (errorResponse) {
            console.warn(errorResponse);
            discographyObject.err = errorResponse.data;
          });
        promises.push(mbPromise);
      }
      $q.all(promises)
        .then(function (promisesResponse) {
          __processData({
            out: discographyObject,
            inLastFm: lastFmResponse,
            inMb: mbResponse
          }, artistName);

          discographyObject.buildInProgress = false;
          if (!_.isUndefined(onReadyCb))
            onReadyCb(discographyObject);
        }, function(promisesRejection) {
          console.error(promisesRejection);
        });
      return discographyObject;
    }
  });
