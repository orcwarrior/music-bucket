'use strict';

describe('Service: mbPlayerEngine', function () {

  // load the service's module
  beforeEach(module('musicBucketApp'));

  // instantiate service
  var mbPlayerEngine;
  beforeEach(inject(function (_mbPlayerEngine_) {
    mbPlayerEngine = _mbPlayerEngine_;
  }));

  it('should do something', function () {
    expect(!!mbPlayerEngine).toBe(true);
  });

});
