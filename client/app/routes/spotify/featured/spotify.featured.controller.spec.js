'use strict';

describe('Controller: SpotifyFeaturedCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SpotifyFeaturedCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SpotifyFeaturedCtrl = $controller('SpotifyFeaturedCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
