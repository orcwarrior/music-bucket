'use strict';

describe('Controller: SpotifyUserCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SpotifyUserCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SpotifyUserCtrl = $controller('SpotifyUserCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
