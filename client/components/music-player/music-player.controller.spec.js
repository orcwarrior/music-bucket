'use strict';

describe('Controller: MusicPlayerCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var MusicPlayerCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MusicPlayerCtrl = $controller('MusicPlayerCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
