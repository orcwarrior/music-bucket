'use strict';

describe('Directive: mbPlayerPlaylistEntry', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mbPlayerPlaylistEntry/mbPlayerPlaylistEntry.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mb-player-playlist-entry></mb-player-playlist-entry>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mbPlayerPlaylistEntry directive');
  }));
});