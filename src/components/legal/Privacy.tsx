// TODO: DRY violation - All legal components (Privacy, Terms, Support) follow same structure
// Consider creating a LegalPage wrapper component with consistent styling and layout
export function Privacy() {
  return (
    <div>
      <h1>Privacy Policy</h1>
      <p>Last updated: January 10, 2026</p>

      <section>
        <h2>Information We Collect</h2>
        <p>
          PlanWell Finance collects information you provide when creating an account,
          including your email address and any budget data you enter.
        </p>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <p>
          Your information is used solely to provide and improve the PlanWell Finance service.
          We do not sell or share your personal data with third parties.
        </p>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>
          We use Firebase Authentication and Firestore to securely store your data.
          All data is encrypted in transit and at rest.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>
          You have the right to access, modify, or delete your personal data at any time
          by contacting us or using the account management features.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For privacy-related questions, please contact us through the <a href="/support">Support</a> page.
        </p>
      </section>
    </div>
  )
}
