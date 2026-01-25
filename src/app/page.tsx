import { Questionnaire } from '@/components/questionnaire/Questionnaire'
import { Phone, Mail, MapPin, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-usfr-light">
      {/* Header */}
      <header className="bg-usfr-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">US Foreclosure Recovery</h1>
                <p className="text-xs text-white/70">Surplus Funds Claim Application</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="tel:+18885458007" className="flex items-center gap-2 hover:text-usfr-accent transition-colors">
                <Phone className="w-4 h-4" />
                (888) 545-8007
              </a>
              <a href="mailto:claim@usforeclosurerecovery.com" className="flex items-center gap-2 hover:text-usfr-accent transition-colors">
                <Mail className="w-4 h-4" />
                claim@usforeclosurerecovery.com
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-usfr-gradient text-white pb-16 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Client Intake Questionnaire
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Complete this questionnaire to begin your surplus funds claim.
            Our team will review your information and contact you within 24-48 hours.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <Questionnaire />
      </main>

      {/* Footer */}
      <footer className="bg-usfr-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              <div className="space-y-3 text-sm text-white/70">
                <a href="tel:+18885458007" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  (888) 545-8007
                </a>
                <a href="mailto:claim@usforeclosurerecovery.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  claim@usforeclosurerecovery.com
                </a>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>30 N Gould St, Ste R<br />Sheridan, WY 82801</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="https://usforeclosurerecovery.com" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="https://usforeclosurerecovery.com/the-process" className="hover:text-white transition-colors">The Process</a></li>
                <li><a href="https://usforeclosurerecovery.com/faqs" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="https://usforeclosurerecovery.com/contact-us" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="https://usforeclosurerecovery.com/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="https://usforeclosurerecovery.com/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="https://usforeclosurerecovery.com/disclaimer" className="hover:text-white transition-colors">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/50">
            <p>&copy; {new Date().getFullYear()} US Foreclosure Recovery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
