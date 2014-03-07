
# dashboards-stripe-subscriptions

A [Stripe](https://stripe.com) [subscriptions](https://github.com/stripe-cohort) plugin for [segmentio/dashboards](https://github.com/segmentio/dashboards).

Use this plugin to visualize Stripe subscription and MRR changes over time.

![](https://f.cloud.github.com/assets/658544/2361169/09325510-a62e-11e3-8f49-e327e89595cd.png)

## Installation

    $ npm install dashboards-stripe-subscriptions

## Example

```js
var Dashboards = require('dashboards');
var subscriptions = require('dashboards-stripe-subscriptions');

new Dashboards()
  .use(subscriptions('stripe-key'))
  .run();
```

#### Plans

If you provide the Stripe plan name to plan id mapping, then the module can get you plan level statistics.

```js
var plans = {
  project: 'project-id',
  startup: 'startup-id',
  growth: 'growth-id'
};

var dashboards = new Dashboards()
  .use(subscriptions('stripe-key', { plans: plans }))
  .run();
```

#### Filter Customers

You can further `filter` customers using [stripe-cohorts](https://github.com/segmentio/stripe-cohorts) filters:

```js
new Dashboards()
  .use(subscriptions('stripe-key', { filter: filter }))
  .run();

function filter (customer) {
  return customer.id !== 'cus_8239d2jd9j'; // filter enterprise customer X
}
```

## Metrics

The metrics exposed by this plugin are divided by date granularity.

Daily:
- `stripe.active new subscriptions today`
- `stripe.active new MRR today` 
- `stripe.active new subscriptions yesterday`
- `stripe.active new MRR yesterday`
- `stripe.active new subscriptions 2 days ago`
- `stripe.active new MRR 2 days ago`

Weekly:
- `stripe.active new MRR 0-1 weeks ago`
- `stripe.active new subscriptions 0-1 weeks ago`
- `stripe.active new MRR 1-2 weeks ago`
- `stripe.active new subscriptions 1-2 weeks ago`

Monthly:
- `stripe.active new MRR 0-1 months ago`
- `stripe.active new subscriptions 0-1 months ago`
- `stripe.active new MRR 1-2 months ago`
- `stripe.active new subscriptions 1-2 months ago`

Total: 
- `stripe.active self service MRR`
- `stripe.active subscription`

Weekly Sparkline: 
- `stripe.active new subscriptions for the last week`
- `stripe.active new mrr for the last week`

## Quickstart

Here's a full example of a [Geckoboard](https://github.com/segmentio/geckoboard) dashboard showing Stripe subscription dashboards:

```js
var Dashboards = require('dashboards');
var subscriptions = require('dashboards-stripe-subscriptions');
var pipe = require('parallel-ware-pipe');
var geckoboard = require('geckoboard')('api-key');

new Dashboards()
  .use(subscriptions('stripe-key'))
  .use(pipe('stripe.active new mrr for the last week', widget('widget-id').sparkline))
  .use(pipe('stripe.total charged 0-1 months ago', 'stripe.total charged 1-2 months ago', widget('widget-id').percentageChange))
  .use(pipe('stripe.active new subscriptions for the last week', widget('widget-id').sparkline))
  .use(pipe('stripe.active new subscriptions 0-1 months ago', 'stripe.active new subscriptions 1-2 months ago', widget('widget-id').percentageChange))
  .run();
```

## License

MIT