'use strict';

describe('Controller: IdeasCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var IdeasCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    IdeasCtrl = $controller('IdeasCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
