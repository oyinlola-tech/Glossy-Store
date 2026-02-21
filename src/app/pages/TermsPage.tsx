const termsSections = [
  {
    title: 'Acceptance of Terms',
    body:
      'By using Glossy Store, you agree to comply with these terms, related policies, and applicable laws. If you do not agree, discontinue use of the service.',
  },
  {
    title: 'Account Responsibilities',
    body:
      'Users are responsible for accurate registration details, safeguarding credentials, and all activity performed through their accounts.',
  },
  {
    title: 'Orders, Pricing, and Availability',
    body:
      'Product availability and pricing may change without prior notice. We reserve the right to cancel or limit orders in cases of stock issues, pricing errors, or fraud risk.',
  },
  {
    title: 'Payments and Verification',
    body:
      'Orders are processed after successful payment confirmation. Additional verification may be required for selected transactions to protect customers and prevent abuse.',
  },
  {
    title: 'Shipping, Returns, and Refunds',
    body:
      'Delivery timelines are estimates and may vary by location and courier operations. Returns and refunds are handled according to the applicable return/refund policy.',
  },
  {
    title: 'Prohibited Use',
    body:
      'Users must not exploit platform vulnerabilities, submit fraudulent payments, interfere with operations, or use the service for unlawful activities.',
  },
  {
    title: 'Limitation of Liability',
    body:
      'To the maximum extent allowed by law, Glossy Store is not liable for indirect, incidental, or consequential damages resulting from service use, delays, or interruptions.',
  },
  {
    title: 'Updates to Terms',
    body:
      'We may revise these terms from time to time. Continued use after updates means you accept the revised terms. Significant changes may be highlighted on the site.',
  },
];

export function TermsPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide uppercase text-red-500 mb-3">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">Terms of Use</h1>
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            These terms govern access to and use of the Glossy Store platform, including account usage, purchases, payments, and support interactions.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="space-y-5">
          {termsSections.map((section) => (
            <div key={section.title} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-3">{section.title}</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-6">{section.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
