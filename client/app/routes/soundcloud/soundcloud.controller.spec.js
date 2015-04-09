'use strict';

describe('Controller: SoundcloudCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SoundcloudCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SoundcloudCtrl = $controller('SoundcloudCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
