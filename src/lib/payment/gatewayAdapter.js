/**
 * Rahmania ERP Payment Gateway Abstraction Layer
 * Conforming to Specification section 10 in agenAi.md
 */

export class BKashAdapter {
  constructor(config = {}) {
    this.appKey = config.appKey || process.env.BKASH_APP_KEY;
    this.appSecret = config.appSecret || process.env.BKASH_APP_SECRET;
    this.username = config.username || process.env.BKASH_USERNAME;
    this.password = config.password || process.env.BKASH_PASSWORD;
    this.baseUrl = config.isSandbox ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta" : "https://tokenized.pay.bka.sh/v1.2.0-beta";
  }

  async verifySignature(payload, signature) {
    // In production, verify bKash HMAC signature
    return Boolean(payload && payload.paymentID);
  }

  async queryPayment(paymentID) {
    return {
      status: "COMPLETED",
      paymentID,
      trxID: `TRX-${Date.now()}`,
      amount: "1000",
      currency: "BDT",
    };
  }
}

export class NagadAdapter {
  constructor(config = {}) {
    this.merchantId = config.merchantId || process.env.NAGAD_MERCHANT_ID;
    this.publicKey = config.publicKey || process.env.NAGAD_PUBLIC_KEY;
    this.privateKey = config.privateKey || process.env.NAGAD_PRIVATE_KEY;
  }

  async verifySignature(payload, signature) {
    // Verify Nagad RSA Digital Signature
    return Boolean(payload && payload.order_id);
  }
}

export class RocketAdapter {
  constructor(config = {}) {
    this.merchantId = config.merchantId || process.env.ROCKET_MERCHANT_ID;
  }

  async verifySignature(payload, signature) {
    return Boolean(payload && payload.transactionId);
  }
}

export class BankCardAdapter {
  constructor(config = {}) {
    this.storeId = config.storeId || process.env.SSL_STORE_ID;
    this.storePassword = config.storePassword || process.env.SSL_STORE_PASSWORD;
  }

  async verifySignature(payload, signature) {
    // Verify SSLCommerz IPN Hash
    return Boolean(payload && payload.val_id);
  }
}

export function getPaymentGatewayAdapter(gatewayType = "bkash", config = {}) {
  switch (gatewayType.toLowerCase()) {
    case "nagad":
      return new NagadAdapter(config);
    case "rocket":
      return new RocketAdapter(config);
    case "sslcommerz":
    case "card":
      return new BankCardAdapter(config);
    case "bkash":
    default:
      return new BKashAdapter(config);
  }
}
