'use strict';
module.exports = function(app) {
  // Insert routes below
  app.use('/api/lurker/advisor', require('./advisor'));
  app.use('/api/lurker/gallery', require('./gallery'));
  app.use('/api/lurker/station', require('./station'));
  app.use('/api/lurker/situation', require('./situation'));

};
