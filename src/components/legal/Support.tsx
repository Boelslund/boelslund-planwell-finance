// TODO: DRY violation - All legal components (Privacy, Terms, Support) follow same structure
// Consider creating a LegalPage wrapper component with consistent styling and layout
export function Support() {
  return (
    <div>
      <h1>Support</h1>

      <section>
        <h2>Common Questions</h2>

        <h3>How do I create a budget?</h3>
        <p>
          Budget creation is not yet implemented.
          After logging in, navigate to the Dashboard and click "Create Budget" to get started.
        </p>

        <h3>Is my data secure?</h3>
        <p>
          Yes! We use Firebase Authentication and Firestore with encryption to keep your data safe.
          See our Privacy Policy for more details.
        </p>

        <h3>Can I share my budget with others?</h3>
        <p>
          Budget sharing functionality is coming in a future update!
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For additional support or to report issues, please contact:
        </p>
        <p>
          Email: <a href="mailto:sigga.boelslund+planwellfinance@gmail.com">Planwell Finance Support</a>
        </p>
        <p>
          GitHub: <a href="https://github.com/Boelslund/boelslund-planwell-finance" target="_blank" rel="noopener noreferrer">
            github.com/Boelslund/boelslund-planwell-finance
          </a>
        </p>
      </section>

      <section>
        <h2>Report a Bug</h2>
        <p>
          Found a bug? Please open an issue on our GitHub repository with:
        </p>
        <ul>
          <li>Description of the problem</li>
          <li>Steps to reproduce</li>
          <li>Expected vs actual behavior</li>
          <li>Browser and device information</li>
        </ul>
      </section>

    </div>
  )
}
