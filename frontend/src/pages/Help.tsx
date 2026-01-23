// src/pages/Help.tsx
const Help = () => {
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 space-y-8">
      <h1 className="text-2xl font-bold">Help & Support</h1>

      <p className="text-base-content/80">
        Welcome to the Help Center. If you have questions or run into any
        issues, you’ll find useful information below. If you still need
        assistance, feel free to contact us directly.
      </p>

      {/* Common Topics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Common Topics</h2>
        <ul className="list-disc list-inside space-y-2 text-base-content/80">
          <li>Account creation and login issues</li>
          <li>Password reset and security</li>
          <li>Profile and settings management</li>
          <li>Application bugs or unexpected behavior</li>
        </ul>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contact Us</h2>

        <div className="p-4 border rounded-lg space-y-2">
          <p>
            <span className="font-medium">Email:</span>{" "}
            <a href="mailto:support@example.com" className="link link-primary">
              support@example.com
            </a>
          </p>

          <p>
            <span className="font-medium">Phone:</span> +1 (555) 123-4567
          </p>

          <p>
            <span className="font-medium">Support Hours:</span> Monday – Friday,
            9:00 AM – 5:00 PM (EST)
          </p>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-sm text-base-content/60">
        We typically respond to inquiries within 1–2 business days.
      </p>
    </div>
  );
};

export default Help;
