'use strict';

describe('Controller: MainIntroCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var MainIntroCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainIntroCtrl = $controller('MainIntroCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
