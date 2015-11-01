/**
 * Created by orcwa on 25.10.2015.
 */
angular.module("musicBucketEngine")
  .service("discographyCollector", function (lastFmApi, musicbrainzApi, $log, $q, moment) {
    /* middle objects */
    var eAlbumTypes = {
      musicbrainz: "typeMB",
      lastFm: "typeLastFm",
      merged: "typeMerged"
    };

    function discographyCollectorBase() {
      this.getBasicInfos = function () {
        return _.pick(this, 'isWorking', 'name', 'albumArt', 'releaseDate');
      };
      this.getInfos = function () {
        return new Error({msg: "Method should be reimplemented in deriving function!"});
      };
    }

    /* lastFm*/
    function lastFmTrack(track, idx) {
      this.name = track.name;
      this.mbid = undefined;
      this.duration = track.duration; // in seconds
      this.index = idx;
    };
    var discographyCollectorAlbumLastfm = function discographyCollectorAlbumLastfm(lastFmAlbum, artistName) {
      var artPromise = $q.defer();

      this.type = eAlbumTypes.lastFm;
      this.isWorking = false;
      this.name = lastFmAlbum.name;
      this.playcount = lastFmAlbum.playcount;
      this.mbid = lastFmAlbum.mbid;
      this.albumArt = (lastFmAlbum && lastFmAlbum.image && lastFmAlbum.image[3]) ?
        lastFmAlbum.image[3]['#text'] : undefined;

      this.releaseDate = undefined;
      this.tracks = undefined;

      this.getAlbumArt = function () {

        return this.albumArt;
      };

      this.getInfos = function () {
        var self = this;
        var deffered = $q.defer();
        var infos = this.getBasicInfos();
        if (_.isUndefined(this.tracks))
          lastFmApi.album.getInfo(artistName, this.name, this.mbid, undefined, true)
            .then(function (response) {
              var tracks = response.data.album.tracks.track;
              self.tracks = [];
              _.each(tracks, function (track, idx) {
                self.tracks.push(new lastFmTrack(track, idx));
              });
              deffered.resolve(self.tracks);
            });
        else
          deffered.resolve(this.tracks);
        return deffered.promise;
      };
    };
    discographyCollectorAlbumLastfm.prototype = new discographyCollectorBase();

    /* MB */
    function mbTrack(track) {
      this.name = track.title;
      this.mbid = track.id;
      this.duration = track.length / 1000; // in ms -> s
      this.index = track.number;
    };

    var discographyCollectorAlbumMb = function discographyCollectorAlbumMb(mbAlbum) {
      var artPromise = $q.defer();

      this.type = eAlbumTypes.musicbrainz;
      this.isWorking = false;
      this.name = mbAlbum.title;
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
      this.tracks = _.map(mbAlbum.media[0].tracks, function (track) {
        return new mbTrack(track);
      });
      this.playcount = undefined;


      this.getAlbumArt = function () {
        if (_.isUndefined(this.albumArt)) {
          musicbrainzApi.coverArt.get(this.mbid)
            .then(function (response) {
              // TODO: Check for actual idx and thumbnail availability
              this.albumArt = response.data.images[0].thumbnails.large;
              artPromise.resolve(this.albumArt);
            });
          return artPromise;
        }
        else return this.albumArt;
      }
      this.getInfos = function () {
        var deffered = $q.defer();
        var infos = this.getBasicInfos();
        infos.tracks = this.tracks;
        deffered.resolve(infos);
        return deffered.promise;
      };
    };
    discographyCollectorAlbumMb.prototype = new discographyCollectorBase();

    /* Merged */
    var discographyCollectorAlbumWiseMerged = function discographyCollectorAlbumWiseMerged(albumA, albumB) {
      this.type = eAlbumTypes.merged;

      this.playcount = (!_.isUndefined(albumA.playcount) ? albumA.playcount : 0);
      this.playcount += (!_.isUndefined(albumB.playcount) ? albumA.playcount : 0);

      this.name = albumA.name;
      this.mbid = albumA.mbid;
      this.releaseDate = albumA.releaseDate;
      this.albumArt = albumA.albumArt;
      this.tracks = albumA.tracks;

      this.normalizedName = albumA.normalizedName;
      this.getInfos = albumA.getInfos;
      this.getAlbumArt = albumA.getAlbumArt;

      if ((albumA.type != eAlbumTypes.musicbrainz && albumB.type === eAlbumTypes.musicbrainz)
        || (!albumA.tracks && albumB.tracks)) {
        this.name = albumB.name;
        this.mbid = albumB.mbid;
        // always use earlier release date
        if (moment(albumB.releaseDate).isValid() && albumB.releaseDate.isBefore(albumA.releaseDate))
          this.releaseDate = albumB.releaseDate;
        this.tracks = albumB.tracks;
        if (this.tracks) // has some tracks already - MB method is enough :)
          this.getInfos = albumB.getInfos;
      }
      if (albumA.type === eAlbumTypes.musicbrainz ||
         (!_.isUndefined(albumB.albumArt) )) {
        this.albumArt = albumB.albumArt;
        this.getAlbumArt = albumB.getAlbumArt;
      }

    };
    discographyCollectorAlbumWiseMerged.prototype = new discographyCollectorBase();


    /* privates */
    function __processLastFmTopAlbumsResponse(data) {
      return data;
    }

    function __createBaseEntries(conf, artistName) {
      var lastFmLimit = 30;
      conf.out.albums = [];
      _.each(_.first(conf.inLastFm, lastFmLimit), function (album) {
        conf.out.albums.push(new discographyCollectorAlbumLastfm(album, artistName));
      });
      _.each(conf.inMb.releases, function (album) {
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
          lastFmAlbum = (album.type === eAlbumTypes.lastFm) ? album : otherAlbum;
          mbAlbum = (album.type === eAlbumTypes.musicbrainz) ? album : otherAlbum;
          out.albums[idx] = new discographyCollectorAlbumWiseMerged(lastFmAlbum, mbAlbum);
          out.albums.splice(out.albums.indexOf(otherAlbum), 1);
        }
      });
      $log.info("Mbid reduction: " + pre + " -> " + out.albums.length);
      return out;
    }

    function __normalizeName(album) {
      album.normalizedName = album.name;
      album.normalizedName = s(album.normalizedName)
        .clean()
        .cleanDiacritics()
        .toLowerCase()
        .replace("'", "")
        .replace("&", "and")
        .replace(" ep", "")
        .replace(" e.p.", "")
        .replace("pt.", "part")
        .replace("[", "(")
        .replace("]", ")")
        // TODO: all of them as regex in braces
        .replace("deluxe", "")
        .replace("gold", "")
        .replace("diamond", "")
        .replace("bonus tracks", "")
        .replace("bonus", "")
        .replace("version", "")
        .replace("edition", "")
        .replace("(single)", "")
        .clean()
        .replace("()", "")
        .replace("( )", "")
        .replace("-", "")
        .clean()
        .value();
      // cut out "single" if its at ends
      if (s.endsWith(album.normalizedName, "single"))
        album.normalizedName = album.normalizedName.substring(0, album.normalizedName.length - 6);
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
                out.albums[idx] = new discographyCollectorAlbumWiseMerged(album, out.albums[oIdx]);
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
        return -album.playcount;
      });
    }

    function __processData(conf, artistName) {
      __createBaseEntries(conf, artistName);
      __mergeByMbid(conf.out);
      __mergeByName(conf.out);
      __sortAlbums(conf.out);

      return conf.out;
    }


    /* CONSTRUCTOR */
    /* return public method */
    return function discographyCollector(artistName, artistMbid, onReadyCb) {
      var discographyObject = {
        artist: {name: artistName, mbid: artistMbid},
        buildInProgress: true
      };
      var lastFmResponse, mbResponse;
      var flow = new Flow;
      flow.parallel(function (next) {
        lastFmApi.artist.getTopAlbums(artistName, artistMbid)
          .then(function (response) {
            if (response.status == 200 && response.data.topalbums)
              lastFmResponse = __processLastFmTopAlbumsResponse(response.data.topalbums.album);
            $log.info("discographyCollector: Last.fm albums: " + lastFmResponse.length);
            next();
          });
      })
        .parallel(function (next) {
          if (artistMbid)
            musicbrainzApi.search.release({getParams: {artist: artistMbid}}, 30, ['recordings'])
              .then(function (response) {
                mbResponse = response.data;
                $log.info("discographyCollector: MB albums: " + mbResponse['release-count']);
                next();
              });
          else { /* some artist are so hipster - they don't even have they mbid*/
            mbResponse = [];
            next();
          }
        })
        .join()
        .series(function (next) {
          __processData({
            out: discographyObject,
            inLastFm: lastFmResponse,
            inMb: mbResponse
          }, artistName);
          next();
        })
        .end(function () {
          discographyObject.buildInProgress = false;
          if (!_.isUndefined(onReadyCb))
            onReadyCb(discographyObject);
        });

      return discographyObject;

    }
  });
