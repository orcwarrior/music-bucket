'use strict';

describe('Controller: discoverCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var discoverCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    discoverCtrl = $controller('discoverCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
