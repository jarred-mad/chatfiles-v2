'use client';

import Link from 'next/link';
import { useState } from 'react';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Basic access to the archive',
    features: [
      'Full-text search',
      'View all documents',
      'Browse photo gallery',
      'Basic filters',
      'Ad-supported',
    ],
    notIncluded: [
      'API access',
      'Bulk downloads',
      'Saved searches',
      'Email alerts',
      'Ad-free experience',
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
    popular: false,
  },
  {
    name: 'Pro',
    price: 9,
    period: 'month',
    description: 'For researchers and journalists',
    features: [
      'Everything in Free',
      'Ad-free experience',
      'API access (1,000 req/day)',
      'Bulk download (up to 100 files)',
      'Save up to 50 searches',
      'Email alerts for new documents',
      'Priority support',
    ],
    notIncluded: [
      'Unlimited API access',
      'Raw data export',
    ],
    cta: 'Subscribe to Pro',
    ctaDisabled: false,
    popular: true,
    stripePriceId: 'price_pro_monthly',
  },
  {
    name: 'Institutional',
    price: 99,
    period: 'month',
    description: 'For organizations and research teams',
    features: [
      'Everything in Pro',
      'Unlimited API access',
      'Unlimited bulk downloads',
      'Raw data export (JSON/CSV)',
      'Face embedding access',
      'Dedicated support',
      'Custom integrations',
      'Team accounts (up to 10)',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    ctaDisabled: false,
    popular: false,
  },
];

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) through our secure payment processor, Stripe.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
  },
  {
    question: 'What is included in API access?',
    answer: 'API access allows you to programmatically search documents, retrieve metadata, and access extracted data. See our API documentation for details.',
  },
  {
    question: 'Do you offer academic discounts?',
    answer: 'Yes! We offer 50% discounts for verified academic institutions. Contact us with your .edu email for verification.',
  },
  {
    question: 'What format is the raw data export?',
    answer: 'Raw data can be exported as JSON or CSV files, including document metadata, OCR text, extracted names, and face cluster data.',
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const getPrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    return billingPeriod === 'yearly' ? Math.round(basePrice * 10) : basePrice;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Choose Your Plan
          </h1>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            Get enhanced access to the DOJ Epstein Files archive. Support the project
            while unlocking powerful research tools.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-navy-light rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-navy'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-navy'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs text-green-400">Save 17%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-accent' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-accent text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${getPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">
                      /{billingPeriod === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                </div>

                <button
                  disabled={plan.ctaDisabled}
                  className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-accent hover:bg-accent-hover text-white'
                      : plan.ctaDisabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-navy hover:bg-navy-light text-white'
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 opacity-50">
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-sm text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-navy py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Need a custom solution?
          </h2>
          <p className="text-gray-300 mb-6">
            Contact us for custom integrations, academic partnerships, or enterprise needs.
          </p>
          <Link
            href="mailto:sales@chatfiles.org"
            className="inline-flex items-center gap-2 bg-white text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}
