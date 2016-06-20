'use strict';

describe('Controller: SpotifyCategoriesCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SpotifyCategoriesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SpotifyCategoriesCtrl = $controller('SpotifyCategoriesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
