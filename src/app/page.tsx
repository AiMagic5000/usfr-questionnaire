import { Questionnaire } from '@/components/questionnaire/Questionnaire'

export default function Home() {
  return (
    <div className="bg-usfr-light py-8">
      {/* Hero Section - Minimal for Webflow embed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-usfr-primary mb-4">
          Client Intake Questionnaire
        </h2>
        <p className="text-lg text-usfr-dark/80 max-w-2xl mx-auto">
          Complete this questionnaire to begin your surplus funds claim.
          Our team will review your information and contact you within 24-48 hours.
        </p>
      </div>

      {/* Questionnaire Form */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Questionnaire />
      </main>
    </div>
  )
}
