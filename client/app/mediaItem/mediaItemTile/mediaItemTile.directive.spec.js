'use strict';

describe('Directive: spotifyPlaylistTile', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/routes/spotify/directives/spotifyPlaylistTile/spotifyPlaylistTile.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<spotify-playlist-tile></spotify-playlist-tile>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the spotifyPlaylistTile directive');
  }));
});