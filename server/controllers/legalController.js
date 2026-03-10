const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');

// ─── Default content ──────────────────────────────────────────────────────────

const DEFAULTS = {
  privacy_policy: {
    title: 'Privacy Policy',
    lastUpdated: 'March 10, 2026',
    intro: 'At Wellness Fuel, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.',
    sections: [
      {
        id: 's1',
        heading: 'Information We Collect',
        content: 'We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes your name, email address, shipping address, phone number, and payment information. We also automatically collect certain information when you visit our website, including your IP address, browser type, pages visited, and purchase history.',
      },
      {
        id: 's2',
        heading: 'How We Use Your Information',
        content: 'We use the information we collect to process your orders and payments, send you order confirmations and shipping updates, provide customer support, send promotional communications (with your consent), improve our products and services, comply with legal obligations, and prevent fraud and abuse.',
      },
      {
        id: 's3',
        heading: 'Information Sharing',
        content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, such as payment processors, shipping companies, and email service providers. These parties are contractually obligated to keep your information confidential.',
      },
      {
        id: 's4',
        heading: 'Data Security',
        content: 'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.',
      },
      {
        id: 's5',
        heading: 'Cookies',
        content: 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookies through your browser settings. Disabling cookies may affect the functionality of our website.',
      },
      {
        id: 's6',
        heading: 'Your Rights',
        content: 'You have the right to access, update, or delete your personal information at any time by logging into your account or contacting us. You may also opt out of marketing communications by clicking the unsubscribe link in any email we send you.',
      },
      {
        id: 's7',
        heading: 'Contact Us',
        content: 'If you have any questions about this Privacy Policy, please contact us at privacy@wellnessfuel.com or write to us at our registered address.',
      },
    ],
  },

  terms: {
    title: 'Terms & Conditions',
    lastUpdated: 'March 10, 2026',
    intro: 'Please read these Terms & Conditions carefully before using the Wellness Fuel website. By accessing or using our service, you agree to be bound by these terms.',
    sections: [
      {
        id: 's1',
        heading: 'Acceptance of Terms',
        content: 'By accessing or using the Wellness Fuel website, you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our service.',
      },
      {
        id: 's2',
        heading: 'Account Registration',
        content: 'To make purchases, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information during registration and to update this information as necessary.',
      },
      {
        id: 's3',
        heading: 'Product Information',
        content: 'We strive to provide accurate product descriptions, images, and pricing. However, we reserve the right to correct any errors and to change or update information at any time. Product images are for illustrative purposes only, and the actual product may vary slightly.',
      },
      {
        id: 's4',
        heading: 'Pricing and Payment',
        content: 'All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time. Payment must be made in full before order dispatch. We accept major credit/debit cards, UPI, net banking, and cash on delivery.',
      },
      {
        id: 's5',
        heading: 'Shipping and Delivery',
        content: 'We aim to dispatch orders within 1-2 business days. Delivery times vary by location but are typically 3-7 business days. Wellness Fuel is not responsible for delays caused by courier services, natural disasters, or other circumstances beyond our control.',
      },
      {
        id: 's6',
        heading: 'Intellectual Property',
        content: 'All content on the Wellness Fuel website, including text, graphics, logos, images, and software, is the property of Wellness Fuel and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.',
      },
      {
        id: 's7',
        heading: 'Limitation of Liability',
        content: 'Wellness Fuel shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, our service. Our total liability to you for any claim arising out of or in connection with these terms shall not exceed the amount paid for the order giving rise to such claim.',
      },
      {
        id: 's8',
        heading: 'Governing Law',
        content: 'These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.',
      },
    ],
  },

  return_policy: {
    title: 'Return & Refund Policy',
    lastUpdated: 'March 10, 2026',
    intro: 'Your satisfaction is our priority. We offer a hassle-free return and refund process to ensure you are completely happy with your purchase.',
    sections: [
      {
        id: 's1',
        heading: 'Return Window',
        content: 'We accept returns within 7 days of delivery for most products. To be eligible for a return, the item must be unused, in its original packaging, and in the same condition as received. Certain products such as opened supplements, perishables, and items marked as non-returnable are exempt from this policy.',
      },
      {
        id: 's2',
        heading: 'How to Initiate a Return',
        content: 'To initiate a return, log into your account and go to My Orders. Select the order and click "Request Return." Alternatively, email us at returns@wellnessfuel.com with your order number and reason for return. Our team will review your request and respond within 24 hours with further instructions.',
      },
      {
        id: 's3',
        heading: 'Return Pickup',
        content: 'Once your return request is approved, we will arrange a free pickup from your delivery address. Please ensure the item is securely packed and ready for pickup within 2 business days of approval. Retain the pickup tracking number for reference.',
      },
      {
        id: 's4',
        heading: 'Refund Process',
        content: 'Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund. Approved refunds are processed within 5-7 business days. Refunds are credited back to the original payment method. UPI and bank transfer refunds may take 3-5 additional banking days.',
      },
      {
        id: 's5',
        heading: 'Damaged or Defective Products',
        content: 'If you receive a damaged or defective product, please contact us within 48 hours of delivery with photographs of the damage. We will arrange a replacement or full refund at no additional cost. Do not return damaged products without prior authorization.',
      },
      {
        id: 's6',
        heading: 'Non-Returnable Items',
        content: 'The following items cannot be returned: products that have been opened or used, items purchased during clearance sales, gift cards, and any product specifically marked as non-returnable at the time of purchase.',
      },
      {
        id: 's7',
        heading: 'Exchange Policy',
        content: 'We offer exchanges for products of equal or lesser value. If you wish to exchange for a higher-priced item, you will need to pay the difference. Please contact our support team to arrange an exchange after your return has been approved.',
      },
    ],
  },

  faq: {
    title: 'Frequently Asked Questions',
    lastUpdated: 'March 10, 2026',
    intro: 'Find answers to the most common questions about our products, ordering, shipping, and more.',
    categories: [
      {
        id: 'c1',
        name: 'Orders & Shipping',
        items: [
          { id: 'q1', question: 'How long does delivery take?', answer: 'Standard delivery takes 3-7 business days depending on your location. Metro cities usually receive orders in 3-4 business days. You will receive a tracking link via SMS and email once your order is dispatched.' },
          { id: 'q2', question: 'Do you offer free shipping?', answer: 'Yes! We offer free shipping on all orders above ₹999. For orders below this threshold, a flat shipping fee of ₹49 applies.' },
          { id: 'q3', question: 'Can I modify or cancel my order?', answer: 'Orders can be modified or cancelled within 1 hour of placement. After that, the order enters processing and changes may not be possible. Please contact our support team immediately at support@wellnessfuel.com.' },
          { id: 'q4', question: 'Do you ship internationally?', answer: 'Currently, we only ship within India. We are working on expanding our delivery to international locations. Please subscribe to our newsletter for updates.' },
        ],
      },
      {
        id: 'c2',
        name: 'Products & Quality',
        items: [
          { id: 'q5', question: 'Are your products FSSAI certified?', answer: 'Yes, all Wellness Fuel products are FSSAI approved and manufactured in GMP-certified facilities. We follow strict quality control processes to ensure every product meets the highest safety and efficacy standards.' },
          { id: 'q6', question: 'Are your supplements suitable for vegetarians/vegans?', answer: 'Many of our products are suitable for vegetarians and vegans. Product pages clearly indicate dietary suitability. Look for the "V" or "Vegan" badge on the product listing.' },
          { id: 'q7', question: 'What is the shelf life of your products?', answer: 'All products display a best-before date on the packaging. Typically, our supplements have a shelf life of 18-24 months from the date of manufacture. Store products in a cool, dry place away from direct sunlight.' },
          { id: 'q8', question: 'Can I take multiple supplements together?', answer: 'We recommend consulting a healthcare professional before combining multiple supplements. Our expert team is available for personalized advice through the consultation feature on our website.' },
        ],
      },
      {
        id: 'c3',
        name: 'Payments',
        items: [
          { id: 'q9', question: 'What payment methods do you accept?', answer: 'We accept all major credit and debit cards (Visa, Mastercard, RuPay), UPI (PhonePe, Google Pay, Paytm), net banking, and Cash on Delivery (COD) for eligible pin codes.' },
          { id: 'q10', question: 'Is it safe to pay online on your website?', answer: 'Absolutely. Our website uses 256-bit SSL encryption to protect your payment information. We do not store your card details. All transactions are processed through PCI-DSS compliant payment gateways.' },
          { id: 'q11', question: 'Do you offer EMI options?', answer: 'Yes, we offer no-cost EMI on select credit cards for orders above ₹2,999. Available EMI options are displayed at checkout based on your cart value.' },
        ],
      },
      {
        id: 'c4',
        name: 'Returns & Refunds',
        items: [
          { id: 'q12', question: 'What is your return policy?', answer: 'We accept returns within 7 days of delivery for unopened products in original packaging. Please visit our Return Policy page for full details.' },
          { id: 'q13', question: 'How long does a refund take?', answer: 'Once your return is received and inspected, refunds are processed within 5-7 business days to your original payment method. Bank transfers may take an additional 3-5 banking days.' },
          { id: 'q14', question: 'What if I receive a damaged product?', answer: 'Please contact us within 48 hours of delivery with clear photographs of the damage. We will arrange a replacement or full refund at no cost to you. Email us at support@wellnessfuel.com.' },
        ],
      },
    ],
  },
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// @desc  Get legal page content (public)
// @route GET /api/legal/:page
const getLegalPage = asyncHandler(async (req, res) => {
  const { page } = req.params;
  const validPages = ['privacy_policy', 'terms', 'return_policy', 'faq'];
  if (!validPages.includes(page)) {
    res.status(404);
    throw new Error('Legal page not found');
  }

  const setting = await Settings.findOne({ key: `legal_${page}` });
  const content = setting ? setting.value : DEFAULTS[page];

  res.json({ success: true, page, content });
});

// @desc  Update legal page content (admin)
// @route PUT /api/admin/legal/:page
const updateLegalPage = asyncHandler(async (req, res) => {
  const { page } = req.params;
  const validPages = ['privacy_policy', 'terms', 'return_policy', 'faq'];
  if (!validPages.includes(page)) {
    res.status(404);
    throw new Error('Legal page not found');
  }

  const { content } = req.body;
  if (!content) {
    res.status(400);
    throw new Error('Content is required');
  }

  await Settings.findOneAndUpdate(
    { key: `legal_${page}` },
    { key: `legal_${page}`, value: content, group: 'legal', type: 'json' },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: 'Legal page updated successfully' });
});

module.exports = { getLegalPage, updateLegalPage };
