
# metrics-stripe-subscriptions

A [Stripe](https://stripe.com) [subscriptions](https://github.com/stripe-subscriptions) plugin for [segmentio/metrics](https://github.com/segmentio/metrics).

Use this plugin to visualize Stripe subscriptions over time.

![](https://f.cloud.github.com/assets/658544/2361169/09325510-a62e-11e3-8f49-e327e89595cd.png)

## Installation

    $ npm install metrics-stripe-subscriptions 

## Quickstart

Here's a full example of a [Geckoboard](https://github.com/segmentio/geckoboard) dashboard showing Stripe subscription metrics:

```js
var Metrics = require('metrics');
var subscriptions = require('metrics-stripe-subscriptions');
var geckoboard = require('geckoboard')('api-key');

new Metrics()
  .every('10m', subscriptions('stripe-key'))
  .use(function (metrics) {
    metrics.on('stripe subscriptions today', geckboard('widget-id').number);
  });
```

#### Filter Customers

You can further `filter` customers using [stripe-subscriptions](https://github.com/segmentio/stripe-chages) filters:

```js
new Metrics()
  .every('10m', subscriptions('stripe-key', { filter: filter }))

function filter (customer) {
  return customer.id !== 'cus_8239d2jd9j'; // filter enterprise customer X
}
```

## Metrics

The metrics exposed by this plugin are divided by date granularity.

Daily:
- `stripe subscriptions today` - the number of subscriptions today
- `stripe subscription mrr today` - the amount subscription mrr today
- `stripe subscriptions yesterday` - the number of subscriptions yesterday
- `stripe subscription mrr yesterday` - the amount subscription mrr yesterday
- `stripe subscriptions 2 days ago` - the number of subscriptions 2 days ago
- `stripe subscription mrr 2 days ago` - the amount subscription mrr 2 days ago

Weekly:
- `stripe subscriptions past week` - the number of subscriptions last week
- `stripe subscription mrr past week` - total subscription mrr last week
- `stripe subscriptions 2 weeks ago` - the number of subscriptions 2 weeks ago
- `stripe subscription mrr 2 weeks ago` - total subscription mrr 2 weeks ago

Monthly:
- `stripe subscriptions past month` - the number of subscriptions last month
- `stripe subscription mrr past month` - total subscription mrr last month
- `stripe subscriptions 2 months ago` - the number of subscriptions 2 months ago
- `stripe subscription mrr 2 months ago` - total subscription mrr 2 months ago

Total: 
- `stripe subscriptions` - total amount of Stripe subscriptions
- `stripe subscription mrr` - total amount subscription mrr

Weekly Sparkline: 
- `stripe subscriptions last week` - an array of subscriptions in the past 7 days
- `stripe subscription mrr last week` - an array of subscription amounts in the past 7 days

## License

MIT
