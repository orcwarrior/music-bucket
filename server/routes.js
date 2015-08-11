/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/playlist', require('./api/playlist'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  // DK: For heroku deployment proxies moved to regular url:

  app.all('/songza-api/*', require('./proxy/songza-api'));
  app.all('/songza-api-proxy/*', require('./proxy/songza-api-proxy'));
  app.all('/musicbrainz-api/*', require('./proxy/musicbrainz-api'));
  app.all('/coverartarchive-api/*', require('./proxy/coverartarchive-api'));
  app.all('/proxy/*', require('./proxy/generic'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
