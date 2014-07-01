
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
      set(metrics, subscriptions, plans, 'all time', new Date(0), today);
      set(metrics, subscriptions, plans, 'today', floor(today), today);
      set(metrics, subscriptions, plans, 'yesterday', Dates.day.shift(today, -1), today);
      set(metrics, subscriptions, plans, '2 days ago', Dates.day.shift(today, -2), today);
      set(metrics, subscriptions, plans, 'last week', Dates.week.shift(today, -1), today);
      set(metrics, subscriptions, plans, '2 weeks ago', Dates.week.shift(today, -2), Dates.week.shift(today, -1));
      set(metrics, subscriptions, plans, 'last month', Dates.month.shift(today, -1), today);
      set(metrics, subscriptions, plans, '2 months ago', Dates.month.shift(today, -2), Dates.month.shift(today, -1));

      // daily
      daily(metrics, subscriptions);
    });
  };
}

/**
 * Set metrics for the given `key` and time interval.
 *
 * @param {Metrics} metrics
 * @param {Array|Charge} subscriptions
 * @param {String} key
 * @param {Object} plans
 * @param {Date} start
 * @param {Date} end
 */

function set (metrics, subscriptions, plans, key, start, end) {
  subscriptions = subscriptions.started(start, end);
  metrics.set('stripe subscriptions ' + key, subscriptions.count());
  metrics.set('stripe subscriptions mrr ' + key, subscriptions.mrr());

  Object.keys(plans).forEach(function (name) {
    var id = plans[name];
    var s = subscriptions.plan(id);
    metrics.set('stripe ' + name + ' subscriptions ' + key, s.count());
    metrics.set('stripe ' + name + ' subscriptions mrr ' + key, s.mrr());
  });
}

/**
 * Get the daily subscription counts for the last week
 *
 * @param {Array|Metric} metrics
 * @param {Array|Charge} subscriptions
 */

function daily (metrics, subscriptions) {
  var today = new Date();

  var numbers = [];
  var amounts = [];

  for (var ago = 7; ago >= 0; ago -= 1) {
    var start = Dates.day.shift(today, -ago);
    var end = Dates.day.shift(today, -ago+1);
    var filtered = subscriptions.started(floor(start), end);
    numbers.push(filtered.count());
    amounts.push(filtered.mrr());
  }

  metrics.set('stripe subscriptions last week', numbers);
  metrics.set('stripe subscription mrr last week', amounts);
}


/**
 * Floor the `date` to the nearest day,
 * while keeping in the same locale
 * (unlike UTC'ing like Dates.day.floor).
 */

function floor (date) {
  date = new Date(date);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
}
