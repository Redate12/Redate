const { stripe } = require('../config/stripe');

class StripeService {
  static async createCustomer(email, metadata = {}) {
    return await stripe.customers.create({
      email,
      metadata,
    });
  }

  static async getCustomer(customerId) {
    return await stripe.customers.retrieve(customerId);
  }

  static async attachPaymentMethod(customerId, paymentMethodId) {
    return await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  static async setDefaultPaymentMethod(customerId, paymentMethodId) {
    return await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  static async createSubscription(customerId, priceId) {
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
  }

  static async updateSubscription(subscriptionId, priceId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
    });
  }

  static async cancelSubscriptionAtPeriodEnd(subscriptionId) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  static async getSubscription(subscriptionId) {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  static async createPaymentIntent(customerId, paymentMethodId, amount, description) {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      description,
    });
  }

  static async cancelPaymentIntent(paymentIntentId) {
    return await stripe.paymentIntents.cancel(paymentIntentId);
  }

  static async refundPaymentIntent(paymentIntentId, reason = 'requested_by_customer') {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.charges.data.length === 0) {
      throw new Error('No charges found for this payment intent');
    }

    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason,
    });
  }

  static async createProduct(name, description) {
    return await stripe.products.create({
      name,
      description,
    });
  }

  static async createPrice(productId, amount, currency = 'eur', interval = 'month') {
    return await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency,
      recurring: { interval },
    });
  }

  static async getPrices(product_id) {
    return await stripe.prices.list({
      product: product_id,
      active: true,
    });
  }

  static async getInvoice(invoiceId) {
    return await stripe.invoices.retrieve(invoiceId);
  }

  static async getUpcomingInvoice(customerId) {
    return await stripe.invoices.retrieveUpcoming({
      customer: customerId,
    });
  }

  static async setupIntents(customerId) {
    return await stripe.setupIntents.create({
      customer: customerId,
      usage: 'on_session',
    });
  }
}

module.exports = StripeService;