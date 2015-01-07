
var debug = require('debug')('metrics:stripe:subscriptions');
var Cohort = require('stripe-cohort');
var Dates = require('date-math');

/**
 * Expose `subscriptions`.
 */

module.exports = subscriptions;

/**
 * Return a Stripe subscriptions plugin.
 * @param {String} key
 * @param {Object} options
 */

function subscriptions (key, options) {
  var query = Cohort(key);
  options = options || {};
  // default filter function
  var filter =  options.filter || function () { return true; };
  var plans =  options.plans || {};
  return function (metrics) {
    // select all the subscriptions
    debug('querying stripe subscriptions ..');
    query(new Date(0), new Date(), function (err, customers) {
      if (err) return debug('failed to get stripe subscriptions: %s', err);

      var subscriptions = customers.filter(filter).subscriptions()
        .paid()
        .active();

      debug('found %d stripe subscriptions', subscriptions.count());

      // by time
      var today = new Date();
      var start = new Date(0);

      // last 30 days
      for (var i = 0; i <= 30; i += 1)
        set(metrics, subscriptions, start, Dates.day.shift(today, -i));
      
      // last 52 weeks
      for (var i = 1; i <= 52; i += 1)
        set(metrics, subscriptions, start, Dates.week.shift(today, -i));

      // last 10 years
      for (var i = 1; i <= 10; i += 1)
        set(metrics, subscriptions, start, Dates.year.shift(today, -i));      
    });
  };
}

/**
 * Set subscription metrics from `start` to `end`.
 *
 * @param {Metrics} metrics                    the metrics instance
 * @param {Array|Subscription} subscriptions   the entire list of stripe charges
 * @param {Array|Plan} plans                   a list of the plans
 * @param {Date} start                         the day to start counting
 * @param {Date} end                           the day to end the count
 */


function set (metrics, subscriptions, plans, start, end) {
  subscriptions = subscriptions.started(start, end);
  metrics.set('stripe subscriptions', subscriptions.count(), end);
  metrics.set('stripe subscriptions mrr', subscriptions.mrr(), end);

  Object.keys(plans).forEach(function (name) {
    var id = plans[name];
    var s = subscriptions.plan(id);
    metrics.set('stripe ' + name + ' subscriptions', s.count(), end);
    metrics.set('stripe ' + name + ' subscriptions mrr', s.mrr(), end);
  });
}
