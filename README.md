# US Foreclosure Recovery - Client Intake Questionnaire

A multi-step questionnaire form for surplus funds claim applications, built with Next.js 16, React, and Tailwind CSS.

## Features

- **9-Step Form**: Personal Info, Property, Ownership, Liens, Competing Claims, Deceased Owner, Bankruptcy, Documents, Authorization
- **Progress Tracking**: Visual progress bar with step indicators
- **Form Validation**: Zod schemas with react-hook-form
- **Responsive Design**: Mobile-first with desktop optimizations
- **USFR Branding**: Dark blue (#003366), Medium blue (#0066cc), Orange accent (#ff6600)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub repository
2. Import project in Vercel dashboard
3. Deploy automatically

Or use CLI:
```bash
npx vercel
```

### Environment Variables

For production, set these in your deployment platform:

```env
# Cognabase (Supabase) connection - for form data storage
NEXT_PUBLIC_SUPABASE_URL=https://smb-db.cognabase.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Color Scheme (USFR Branding)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#003366` | Headers, buttons, trust |
| Secondary | `#0066cc` | Links, interactive elements |
| Accent | `#ff6600` | CTAs, highlights |
| Light | `#f5f8fa` | Backgrounds |
| Dark | `#333333` | Body text |

## Form Sections

1. **Personal Information**: Name, DOB, SSN (last 4), contact info, current address
2. **Property Information**: Foreclosed property address, foreclosure type, sale details
3. **Ownership History**: Ownership type, acquisition method, co-owners
4. **Liens & Encumbrances**: Mortgages, HOA, tax liens, judgment liens
5. **Competing Claims**: Awareness of other claimants, notices received
6. **Deceased Owner**: Heir claims, probate info, other heirs (conditional)
7. **Bankruptcy**: Filing history, chapter, case details (conditional)
8. **Document Checklist**: Available supporting documents
9. **Authorization**: Terms agreement, release authorization, e-signature

## API Endpoint

`POST /api/submit` - Receives form data as JSON

TODO for production:
- Connect to Cognabase database (`usfr` schema)
- Send notification emails
- Generate case number

## Project Structure

```
src/
├── app/
│   ├── api/submit/route.ts    # Form submission endpoint
│   ├── page.tsx               # Main page
│   ├── layout.tsx             # Root layout with metadata
│   └── globals.css            # Global styles
├── components/questionnaire/
│   ├── Questionnaire.tsx      # Main form controller
│   ├── ProgressBar.tsx        # Step progress indicator
│   ├── FormInput.tsx          # Reusable form components
│   └── steps/                 # Individual step components
│       ├── PersonalInfoStep.tsx
│       ├── PropertyInfoStep.tsx
│       ├── OwnershipStep.tsx
│       ├── LiensStep.tsx
│       ├── CompetingClaimsStep.tsx
│       ├── DeceasedOwnerStep.tsx
│       ├── BankruptcyStep.tsx
│       ├── DocumentChecklistStep.tsx
│       └── AuthorizationStep.tsx
└── lib/
    └── schema.ts              # Zod validation schemas
```

## Contact

- **Website**: usforeclosurerecovery.com
- **Phone**: (888) 545-8007
- **Email**: claim@usforeclosurerecovery.com
