const faqSections = [
  {
    title: 'Orders',
    items: [
      {
        question: 'How do I place an order?',
        answer:
          'Browse products, choose a variant, add items to cart, and complete checkout. You will receive confirmation after a successful payment.',
      },
      {
        question: 'Can I change my order after payment?',
        answer:
          'If the order has not entered fulfillment, support may help update quantities or shipping details. Contact us quickly with your order ID.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      {
        question: 'How long does delivery take?',
        answer:
          'Delivery time depends on your location and courier schedules. Estimated timelines are shown at checkout and may change during peak periods.',
      },
      {
        question: 'How can I track my shipment?',
        answer:
          'Once shipped, your order status updates in your account. Tracking updates are provided as courier information becomes available.',
      },
    ],
  },
  {
    title: 'Payments & Refunds',
    items: [
      {
        question: 'Which payment methods are accepted?',
        answer:
          'Available methods are shown at checkout and can include cards, supported wallets, or other local options based on your region.',
      },
      {
        question: 'When will I receive a refund?',
        answer:
          'Approved refunds are processed to the original payment method. Processing time varies by payment provider and banking timelines.',
      },
    ],
  },
  {
    title: 'Account & Security',
    items: [
      {
        question: 'I forgot my password. What should I do?',
        answer:
          'Use the Forgot Password page to request a reset and follow the instructions sent to your registered email address.',
      },
      {
        question: 'How do I keep my account secure?',
        answer:
          'Use a strong unique password, avoid sharing login credentials, and report suspicious activity to support immediately.',
      },
    ],
  },
];

export function FaqPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide uppercase text-red-500 mb-3">Help Center</p>
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            Find quick answers about ordering, delivery, payments, returns, and account management. If your question is not listed, contact support.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="space-y-6">
          {faqSections.map((section) => (
            <div key={section.title} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.question} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-black dark:text-white mb-2">{item.question}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
