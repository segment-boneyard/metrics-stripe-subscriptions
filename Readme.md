
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

The metrics exposed by this plugin are:

- `stripe subscriptions` - the number of subscriptions
- `stripe subscriptions mrr` - the monthly recurring revenue amount representing the subscriptions

and are calculated for the last 30 days, last 52 weeks, and last 10 years.

## License

MIT
