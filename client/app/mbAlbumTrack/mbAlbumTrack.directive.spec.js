'use strict';

describe('Directive: mbAlbumTrack', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mbAlbumTrack/mbAlbumTrack.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mb-album-track></mb-album-track>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mbAlbumTrack directive');
  }));
});