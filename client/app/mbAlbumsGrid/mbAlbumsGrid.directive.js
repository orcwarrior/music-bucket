'use strict';

angular.module('musicBucketApp')
  .directive('mbAlbumsGrid', function ($log, albumEntryBuilder, mbPlayerEngine) {
    return {
      templateUrl: 'app/mbAlbumsGrid/mbAlbumsGrid.html',
      restrict: 'EA',
      scope: {
        albums: '=albums',
        themeColor: '=themeColor',
        moreInfosAlbum: '=moreInfosAlbum'
      },
      link: function (scope, element, attrs) {
        scope.artBg = 'http://i.imgur.com/iTEi7Vn.png';
        scope.brokenArt = 'http://i.imgur.com/O612a7j.png';
        scope.loadingArt = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

        scope.selectedAlbumEl = undefined;

        scope.$watch('albums', function (newVal, oldVal) {
          _.each(newVal, function (album, idx) {
            album.__index = idx;
          });
          scope.selectedAlbum = undefined;
          $log.info("New albums arriven: ");
          $log.info(newVal);
        });
        scope.$watch('moreInfosAlbum', function (newVal, oldVal) {

          _.each(scope.albums, function (album, idx) {
            album.__index = idx;
          });

        });
        scope.albumMoreInfos = function (evt, albumObj) {
          if (scope.selectedAlbum) return; // TODO: Link to an album

          var srcEl = evt.target;
          var topAlbum = element[0].querySelector('#topAlbum');
          var moreInfosBG = element[0].querySelector('.mb-albums-more-infos-bg');

          srcEl.style.height = srcEl.getBoundingClientRect().width + 'px';
          __resetOldSelectedAlbumStyle(scope.selectedAlbumEl);

          albumObj.getInfos();
          scope.selectedAlbum = albumObj;
          if (scope.selectedAlbumEl !== srcEl) {
            __setAlbumArtStyle(evt.target, topAlbum);
            // reposition bg center to click pos:
            moreInfosBG.style.left = (evt.clientX - topAlbum.getBoundingClientRect().left) + 'px';
            moreInfosBG.style.top = (evt.clientY - topAlbum.getBoundingClientRect().top ) + 'px';

            scope.selectedAlbumEl = srcEl;
          } else
            scope.selectedAlbum = undefined;
        };
        scope.closeAlbumInfos = function () {
          __resetOldSelectedAlbumStyle(scope.selectedAlbumEl);
          scope.selectedAlbum = undefined;
          scope.selectedAlbumEl = undefined;
        };
        scope.openAlbumMoreInfos = function(album) {
          scope.moreInfosAlbum = album.name;
        };
        scope.addAlbumToPlaylist = function(album) {
          var albumEntry = albumEntryBuilder.build(album);
          mbPlayerEngine.getPlaylist().addEntry(albumEntry);
        };
        /* private */
        function __setAlbumArtStyle(albumEl, topAlbumEl) {
          // fix by margin-bottom:
          var marginFix = albumEl.getBoundingClientRect().height - topAlbumEl.getBoundingClientRect().height;
          albumEl.style.marginBottom = marginFix + 'px';
          albumEl.style.width = topAlbumEl.getBoundingClientRect().width + 'px';
          albumEl.style.height = topAlbumEl.getBoundingClientRect().height + 'px';
          albumEl.style.position = 'relative';
          albumEl.style.zIndex = 2;
          albumEl.style.left = (topAlbumEl.getBoundingClientRect().left - albumEl.getBoundingClientRect().left) + 'px';
          albumEl.style.top = topAlbumEl.getBoundingClientRect().top - albumEl.getBoundingClientRect().top + topAlbumEl.getBoundingClientRect().height / 4 + 'px';
          albumEl.parentElement.style.overflow = 'visible';
        };
        function __resetOldSelectedAlbumStyle(oldEl) {
          if (!_.isUndefined(oldEl)) {
            oldEl.style.marginBottom = 0;
            oldEl.style.width = "100%";
            oldEl.style.height = "initial";
            oldEl.style.position = "";
            oldEl.style.zIndex = 1;
            oldEl.style.left = "";
            oldEl.style.top = "";
          }
          ;
        };

      }
    };
  });
