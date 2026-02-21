const privacySections = [
  {
    title: 'Information We Collect',
    points: [
      'Account information such as name, email address, and profile details.',
      'Order data including products purchased, shipping information, and transaction references.',
      'Technical details such as device/browser data, log activity, and interaction events used for service reliability.',
    ],
  },
  {
    title: 'How We Use Information',
    points: [
      'To process purchases, manage deliveries, verify payments, and provide customer support.',
      'To improve user experience, monitor service performance, and prevent abuse or fraud.',
      'To send relevant service messages such as order confirmations, account notifications, and policy updates.',
    ],
  },
  {
    title: 'Data Sharing',
    points: [
      'We share only necessary data with payment processors, logistics partners, and trusted service providers.',
      'We may disclose information where required by law, legal process, or to protect our platform and users.',
      'We do not sell personal data for third-party marketing.',
    ],
  },
  {
    title: 'Retention & Security',
    points: [
      'Data is retained for operational, security, and legal compliance reasons for a limited period.',
      'We apply technical and organizational safeguards to protect account and transaction information.',
      'No system is completely risk-free, so users should also protect credentials and device access.',
    ],
  },
  {
    title: 'Your Choices',
    points: [
      'You can update account details from your profile where available.',
      'You may request access, correction, or deletion of eligible personal data through support.',
      'You can manage browser cookie settings and some communication preferences.',
    ],
  },
];

export function PrivacyPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide uppercase text-red-500 mb-3">Policy</p>
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            This policy explains how Glossy Store collects, uses, stores, and protects personal data when you use the website and related services.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            By creating an account, placing orders, or contacting support, you consent to the handling of your information as described here and in applicable laws.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="space-y-6">
          {privacySections.map((section) => (
            <div key={section.title} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">{section.title}</h2>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
