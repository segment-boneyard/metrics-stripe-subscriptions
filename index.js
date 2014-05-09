
var Cohort = require('stripe-cohort');
var Dates = require('date-math');

/**
 * Expose `Subscriptions`.
 */

module.exports = Subscriptions;

/**
 * Return a Stripe dashboards data function.
 * @param {String} key
 * @param {Object} options
 */
function Subscriptions (key, options) {
  if (!(this instanceof Subscriptions)) return new Subscriptions(key, options);
  this.cohort = Cohort(key);
  this.options = options || {};
  var self = this;
  return function () { return self.stripe.apply(self, arguments); };
}

/**
 * Generate a Stripe data function.
 *
 * @param {String} key
 * @param {Object} options
 *
 * @returns {Function}
 */

Subscriptions.prototype.stripe = function (data, callback) {
  var self = this;
  var results = data.stripe = (data.stripe || {});
  // select all the customers
  this.cohort(new Date(0), new Date(), function (err, customers) {
    if (err) return callback(err);
    self.last2Days(customers, results);
    self.daily(customers, results);
    self.weekly(customers, results);
    self.monthly(customers, results);
    self.total(customers, results);
    if (self.options.plans) {
      self.monthlyPlans(customers, results);
      self.totalPlans(customers, results);
    }
    callback();
  });
};

/**
 * Calculate active subscriptions for the last two days.
 *
 * @param {Customers} customers
 * @param {Object} results
 */

Subscriptions.prototype.last2Days = function (customers, results) {
  var today = new Date();

  var todaySubscriptions = this.activeSubscriptions(customers, today, today);
  results['active new subscriptions today'] = todaySubscriptions.count();
  results['active new MRR today'] = todaySubscriptions.mrr();

  var yesterday = Dates.day.shift(new Date(), -1);
  var yesterdaySubscriptions = this.activeSubscriptions(customers, yesterday, yesterday);
  results['active new subscriptions yesterday'] = yesterdaySubscriptions.count();
  results['active new MRR yesterday'] = yesterdaySubscriptions.mrr();

  var twoDaysAgo = Dates.day.shift(yesterday, -1);
  var twoDaysAgoSubscriptions = this.activeSubscriptions(customers, twoDaysAgo, twoDaysAgo);
  results['active new subscriptions 2 days ago'] = twoDaysAgoSubscriptions.count();
  results['active new MRR 2 days ago'] = twoDaysAgoSubscriptions.mrr();
};

/**
 * Calculate active subscriptions for the past week.
 *
 * @param {Customers} customers
 * @param {Object} results
 */

Subscriptions.prototype.daily = function (customers, results) {
  var today = new Date();

  var subscriptions = [];
  var mrr = [];

  for (var ago = 7; ago >= 0; ago -= 1) {
    var current = Dates.day.shift(today, -ago);
    var filtered = this.activeSubscriptions(customers, current, current);
    subscriptions.push(filtered.count());
    mrr.push(filtered.mrr());
  }

  results['active new subscriptions for the last week'] = subscriptions;
  results['active new mrr for the last week'] = mrr;
};

/**
 * Calculate the weekly active subscriptions.
 *
 * @param {Customers} customers
 * @param {Object} results
 */

Subscriptions.prototype.weekly = function (customers, results) {
  var now = new Date();

  var oneWeekAgo = Dates.day.shift(now, -7);
  var oneWeekAgoSubscriptions =  this.activeSubscriptions(customers, oneWeekAgo, now);
  results['active new MRR 0-1 weeks ago'] = oneWeekAgoSubscriptions.mrr();
  results['active new subscriptions 0-1 weeks ago'] = oneWeekAgoSubscriptions.count();

  var twoWeeksAgo = Dates.day.shift(oneWeekAgo, -7);
  var twoWeeksAgoSubscriptions = this.activeSubscriptions(customers, twoWeeksAgo, oneWeekAgo);
  results['active new MRR 1-2 weeks ago'] = twoWeeksAgoSubscriptions.mrr();
  results['active new subscriptions 1-2 weeks ago'] = twoWeeksAgoSubscriptions.count();
};

/**
 * Calculate the monthly active subscriptions.
 *
 * @param {Customers} customers
 * @param {Object} results
 */

Subscriptions.prototype.monthly = function (customers, results) {
  var now = new Date();

  var oneMonthAgo = Dates.month.shift(now, -1);
  var oneMonthAgoSubscriptions =  this.activeSubscriptions(customers, oneMonthAgo, now);
  results['active new MRR 0-1 months ago'] = oneMonthAgoSubscriptions.mrr();
  results['active new subscriptions 0-1 months ago'] = oneMonthAgoSubscriptions.count();

  var twoMonthsAgo = Dates.month.shift(oneMonthAgo, -1);
  var twoMonthsAgoSubscriptions = this.activeSubscriptions(customers, twoMonthsAgo, oneMonthAgo);
  results['active new MRR 1-2 months ago'] = twoMonthsAgoSubscriptions.mrr();
  results['active new subscriptions 1-2 months ago'] = twoMonthsAgoSubscriptions.count();
};

/**
 * Calculate the total active MRR.
 *
 * @param {Customers} customers
 * @param {Object} results
 */

Subscriptions.prototype.total = function (customers, results) {
  var subscriptions = this.activeSubscriptions(customers);
  results['active self service MRR'] = subscriptions.mrr();
  results['active subscriptions'] = subscriptions.count();
};

/**
 * Calculate monthly active subscriptions by plan.
 *
 * @param {Customers} customers
 * @param {Object} results
 */

Subscriptions.prototype.monthlyPlans = function (customers, results) {
  var self = this;
  var plans = this.options.plans;

  var now = new Date();
  var oneMonthAgo = Dates.month.shift(now, -1);
  var twoMonthsAgo = Dates.month.shift(oneMonthAgo, -1);

  var oneMonthAgoPlans = {};
  var twoMonthsAgoPlans = {};
  Object.keys(plans).forEach(function (name) {
    var id = plans[name];

    var oneMonthAgoSubscriptions = self.activeSubscriptions(customers, oneMonthAgo, now).plan(id);
    oneMonthAgoPlans[name] = {
      'active MRR': oneMonthAgoSubscriptions.mrr(),
      'active subscriptions': oneMonthAgoSubscriptions.count()
    };

    var twoMonthsAgoSubscriptions = self.activeSubscriptions(customers, twoMonthsAgo, oneMonthAgo).plan(id);
    twoMonthsAgoPlans[name] = {
      'active MRR': twoMonthsAgoSubscriptions.mrr(),
      'active subscriptions': twoMonthsAgoSubscriptions.count()
    };
  });

  results['plan subscriptions 0-1 months ago'] = oneMonthAgoPlans;
  results['plan subscriptions 1-2 months ago'] = twoMonthsAgoPlans;
};

/**
 * Calculate the total active subscriptions by plan.
 *
 * @param {Customers} customers
 * @param {Object} results
 */

Subscriptions.prototype.totalPlans = function (customers, results) {
  var self = this;
  var plans = this.options.plans;
  var byPlan = {};
  Object.keys(plans).forEach(function (name) {
    var id = plans[name];
    var subscriptions = self.activeSubscriptions(customers).plan(id);
    byPlan[name] = {
      'active MRR': subscriptions.mrr(),
      'active subscriptions': subscriptions.count()
    };
  });

  results['plan subscriptions'] = byPlan;
};

/**
 * Filter by active, paid subscriptions.
 *
 * @param {Customers} customers
 * @param {Date} start
 * @param {Date} end
 * @return {Subscriptions}
 */

Subscriptions.prototype.activeSubscriptions = function (customers, start, end) {
  if (this.options.filter) customers = customers.filter(this.options.filter);
  var subscriptions;
  if (start && end) subscriptions = customers.subscriptions(floor(start), ceil(end));
  else subscriptions = customers.subscriptions();
  subscriptions = subscriptions.active().paid();
  return subscriptions;
};

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

/**
 * Floor the `date` to the nearest day,
 * while keeping in the same locale
 * (unlike UTC'ing like Dates.day.floor).
 */

function ceil (date) {
  date = new Date(date);
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  return date;
}
