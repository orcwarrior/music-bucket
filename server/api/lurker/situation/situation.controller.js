var _ = require('lodash');
var situationSchema = require('../../../songzaLurker/models/situation.model');

exports.get = function (req, res) {
  situationSchema
    .findById(req.params.id)
    .populate('situations stations')
    .exec(function (err, situation) {
      if (err) return res.json(500, err);
      if (!situation) return res.json(404, {err: "situation " + req.params.id + " not found!"});
      return res.json(200, situation);
    });

};

exports.search = function (req, res) {
  var limit = req.query.limit || 50;
  delete req.query.limit;
  if (_.isEmpty(req.query))
    return res.json(500, {err: "search query not specified"});

  situationSchema
    .findByQueryString(req.query)
    .limit(limit)
    .exec(function(err, stations) {
      if (err) return res.json(500, err);
      return res.json(200, stations);
    });
}
