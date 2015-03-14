'use strict';

describe('Controller: LocalCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var LocalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LocalCtrl = $controller('LocalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
