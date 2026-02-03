# USFR Dashboard Upgrade - Implementation Checkpoint

**Date**: 2026-02-02
**Branch**: master
**Status**: Implementation in progress

## What's Being Built
Upgrading the USFR Questionnaire Next.js app with:
1. PIN-gated Documents tab (16 DOCX contracts, blurred until 6-digit PIN validated)
2. Agent Identification step in Questionnaire (Step 0 before Personal Info)
3. Notary tab with D3 county map + Yelp-scraped notary database
4. Mobile signature improvements
5. Navigation fixes (back from document viewer -> Documents tab)
6. New Cognabase instance for agent PINs + notary data
7. Mobile responsive sidebar with hamburger menu

## Completed So Far
- [x] 16 DOCX documents copied to /public/documents/
- [x] Dependencies installed (bcryptjs, d3, topojson-client + types)
- [ ] supabase-agents.ts client
- [ ] PIN validation API route
- [ ] contract-documents.ts metadata
- [ ] PinEntryModal component
- [ ] ContractLibrary component
- [ ] AgentIdentificationStep component
- [ ] schema.ts update (agentIdentificationSchema)
- [ ] QuestionnaireContent.tsx update (Step 0)
- [ ] steps/index.ts update
- [ ] CountyMap component (D3)
- [ ] NotaryResults component
- [ ] NotaryTab component
- [ ] Notary API routes
- [ ] UnifiedDashboard.tsx update (Notary tab, mobile sidebar, URL tab restore)
- [ ] SignaturePad.tsx touch fix
- [ ] DocumentSigningView.tsx navigation fix
- [ ] NotaryScheduling.tsx navigation fix
- [ ] Yelp notary scraper (Python)

## Key Files
- Plan: ~/.claude/plans/delightful-conjuring-dragon.md
- App root: /mnt/c/Users/flowc/Documents/usfr-questionnaire
- Dashboard: src/components/dashboard/UnifiedDashboard.tsx
- Questionnaire: src/components/questionnaire/QuestionnaireContent.tsx

## Database
- Existing SMB Cognabase: smb-db.cognabase.com (intake data)
- New USFR Agents instance: usfr-db.cognabase.com (to be created on R730)
- Tables needed: agents, agent_sessions, notaries, notary_scrape_state, notary_county_coverage

## Environment Variables Needed
```
NEXT_PUBLIC_USFR_AGENTS_URL=https://usfr-db.cognabase.com
NEXT_PUBLIC_USFR_AGENTS_ANON_KEY=<pending>
USFR_AGENTS_SERVICE_KEY=<pending>
```

## Resume Instructions
If starting a new session, read this file and the plan at ~/.claude/plans/delightful-conjuring-dragon.md to understand context.
