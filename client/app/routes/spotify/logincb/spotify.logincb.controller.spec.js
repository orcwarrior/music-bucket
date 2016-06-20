'use strict';

describe('Controller: SpotifyLogincbCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SpotifyLogincbCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SpotifyLogincbCtrl = $controller('SpotifyLogincbCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
