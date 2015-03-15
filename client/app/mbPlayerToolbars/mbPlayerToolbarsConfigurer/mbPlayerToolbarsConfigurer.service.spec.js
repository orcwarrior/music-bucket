'use strict';

describe('Service: mbPlayerToolbarsConfigurer', function () {

  // load the service's module
  beforeEach(module('musicBucketApp'));

  // instantiate service
  var mbPlayerToolbarsConfigurer;
  beforeEach(inject(function (_mbPlayerToolbarsConfigurer_) {
    mbPlayerToolbarsConfigurer = _mbPlayerToolbarsConfigurer_;
  }));

  it('should do something', function () {
    expect(!!mbPlayerToolbarsConfigurer).toBe(true);
  });

});
