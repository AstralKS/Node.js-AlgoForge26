# MediAI — Project Folder Structure

> Monorepo. Phase 1 focuses on **Patient Side**.  
> 4 workspaces: `frontend` · `backend` · `ai-service` · `whatsapp-service`

---

```
mediai/
│
├── README.md
├── docker-compose.yml               # spins up all 4 services + DB locally
├── docker-compose.prod.yml
├── .env.example                     # shared env vars reference
├── .gitignore
│
│
├── ── frontend/  ────────────────────────────────────────────────────────────
│   │   (React + Next.js 14 App Router — Patient UI, later Doctor UI)
│   │
│   ├── public/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── src/
│   │   │
│   │   ├── app/                         # Next.js app router pages
│   │   │   │
│   │   │   ├── (auth)/                  # unauthenticated routes
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (patient)/               # ← PHASE 1 FOCUS
│   │   │   │   ├── layout.tsx           # patient shell with sidebar/navbar
│   │   │   │   │
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx         # health overview, AI nudges, quick log
│   │   │   │   │
│   │   │   │   ├── symptoms/
│   │   │   │   │   ├── page.tsx         # symptom history list
│   │   │   │   │   ├── log/
│   │   │   │   │   │   └── page.tsx     # log new symptom (text / voice)
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # single symptom entry detail
│   │   │   │   │
│   │   │   │   ├── medications/
│   │   │   │   │   ├── page.tsx         # current prescriptions + adherence
│   │   │   │   │   ├── log/
│   │   │   │   │   │   └── page.tsx     # log taken / missed dose
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # medication detail + history
│   │   │   │   │
│   │   │   │   ├── biometrics/
│   │   │   │   │   ├── page.tsx         # charts: BP, glucose, heart rate, etc.
│   │   │   │   │   └── log/
│   │   │   │   │       └── page.tsx     # manual biometric entry
│   │   │   │   │
│   │   │   │   ├── visits/
│   │   │   │   │   ├── page.tsx         # past & upcoming appointments
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx     # visit detail: notes, transcript, prescriptions
│   │   │   │   │   └── upload/
│   │   │   │   │       └── page.tsx     # upload lab report / prescription scan
│   │   │   │   │
│   │   │   │   ├── schedule/
│   │   │   │   │   └── page.tsx         # calendar view + doctor appointment sync
│   │   │   │   │
│   │   │   │   ├── messages/
│   │   │   │   │   ├── page.tsx         # message thread list
│   │   │   │   │   └── [doctorId]/
│   │   │   │   │       └── page.tsx     # chat with specific doctor
│   │   │   │   │
│   │   │   │   ├── ai-insights/
│   │   │   │   │   ├── page.tsx         # weekly AI health report
│   │   │   │   │   └── alerts/
│   │   │   │   │       └── page.tsx     # critical/urgent AI alerts
│   │   │   │   │
│   │   │   │   ├── emergency/
│   │   │   │   │   └── page.tsx         # SOS, doctor contact, nearest hospital
│   │   │   │   │
│   │   │   │   └── settings/
│   │   │   │       ├── page.tsx         # profile, notifications
│   │   │   │       ├── whatsapp/
│   │   │   │       │   └── page.tsx     # link WhatsApp number
│   │   │   │       └── notifications/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── (doctor)/                # ← PHASE 2 (scaffold now)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx         # clinical dashboard, risk trends
│   │   │   │   ├── patients/
│   │   │   │   │   ├── page.tsx         # patient list with risk flags
│   │   │   │   │   └── [patientId]/
│   │   │   │   │       └── page.tsx     # patient detail, AI summary, sign report
│   │   │   │   ├── ai-alerts/
│   │   │   │   │   └── page.tsx         # high-risk, review-needed list
│   │   │   │   ├── messages/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx         # AI-learning toggle, risk-alert toggle
│   │   │   │
│   │   │   └── api/                     # Next.js API routes (thin proxies)
│   │   │       └── auth/
│   │   │           └── [...nextauth]/
│   │   │               └── route.ts
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                      # base design system (Button, Card, Badge…)
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Chart.tsx            # recharts wrapper
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── patient/
│   │   │   │   ├── SymptomLogForm.tsx
│   │   │   │   ├── MedicationCard.tsx
│   │   │   │   ├── BiometricChart.tsx   # BP, glucose line charts
│   │   │   │   ├── AIInsightBanner.tsx  # weekly summary card
│   │   │   │   ├── CriticalAlertCard.tsx
│   │   │   │   ├── VoiceLogButton.tsx   # triggers Whisper transcription
│   │   │   │   └── VisitTimeline.tsx
│   │   │   │
│   │   │   ├── doctor/
│   │   │   │   ├── RiskTrendChart.tsx
│   │   │   │   ├── PatientRiskRow.tsx
│   │   │   │   ├── AIReportReview.tsx   # sign & issue AI report
│   │   │   │   └── AlertBadge.tsx
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── Navbar.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       ├── WhatsAppStatus.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── usePatient.ts
│   │   │   ├── useSymptoms.ts
│   │   │   ├── useMedications.ts
│   │   │   ├── useBiometrics.ts
│   │   │   ├── useAIInsights.ts
│   │   │   └── useRealtime.ts           # WebSocket / SSE for live alerts
│   │   │
│   │   ├── services/                    # all API calls to backend
│   │   │   ├── api.ts                   # axios base instance
│   │   │   ├── authService.ts
│   │   │   ├── patientService.ts
│   │   │   ├── symptomService.ts
│   │   │   ├── medicationService.ts
│   │   │   ├── biometricService.ts
│   │   │   ├── visitService.ts
│   │   │   ├── messageService.ts
│   │   │   └── aiService.ts
│   │   │
│   │   ├── store/                       # Zustand or Redux Toolkit
│   │   │   ├── authStore.ts
│   │   │   ├── patientStore.ts
│   │   │   └── alertStore.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   ├── dateHelpers.ts
│   │   │   └── constants.ts
│   │   │
│   │   └── types/
│   │       ├── patient.ts
│   │       ├── doctor.ts
│   │       ├── symptom.ts
│   │       ├── medication.ts
│   │       ├── biometric.ts
│   │       ├── visit.ts
│   │       └── ai.ts
│   │
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
│
├── ── backend/  ─────────────────────────────────────────────────────────────
│   │   (Node.js + Express — REST API + WebSocket)
│   │
│   ├── src/
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── patient.routes.ts
│   │   │   ├── doctor.routes.ts
│   │   │   ├── symptom.routes.ts
│   │   │   ├── medication.routes.ts
│   │   │   ├── biometric.routes.ts
│   │   │   ├── visit.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   ├── ai.routes.ts             # proxy to ai-service
│   │   │   └── whatsapp.routes.ts       # webhook endpoint for WA
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── patient.controller.ts
│   │   │   ├── symptom.controller.ts
│   │   │   ├── medication.controller.ts
│   │   │   ├── biometric.controller.ts
│   │   │   ├── visit.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   └── whatsapp.controller.ts
│   │   │
│   │   ├── models/                      # Prisma schema / Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Patient.ts
│   │   │   ├── Doctor.ts
│   │   │   ├── Symptom.ts               # {date, description, severity, source}
│   │   │   ├── Medication.ts            # {name, dose, frequency, start, end}
│   │   │   ├── MedicationLog.ts         # {taken: bool, time, notes}
│   │   │   ├── Biometric.ts             # {type, value, unit, timestamp}
│   │   │   ├── Visit.ts                 # {date, doctorId, notes, transcript}
│   │   │   ├── AIReport.ts              # {weekOf, summary, riskLevel, signed}
│   │   │   ├── Alert.ts                 # {type: critical|weekly, message, read}
│   │   │   └── Message.ts              
│   │   │
│   │   ├── services/
│   │   │   ├── aiService.ts             # HTTP calls to ai-service
│   │   │   ├── emailService.ts          # nodemailer: alert doctor via email
│   │   │   ├── notificationService.ts   # push / in-app alerts
│   │   │   ├── whatsappService.ts       # calls whatsapp-service
│   │   │   └── riskMonitorService.ts    # runs periodically, checks symptom trends
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts        # JWT verify
│   │   │   ├── role.middleware.ts        # patient / doctor guard
│   │   │   ├── errorHandler.ts
│   │   │   └── validate.ts              # Zod request validation
│   │   │
│   │   ├── jobs/                        # cron jobs
│   │   │   ├── weeklyReportJob.ts       # every Monday: trigger AI weekly report
│   │   │   ├── dailyWhatsAppJob.ts      # send daily health check prompt to WA
│   │   │   └── riskScanJob.ts           # every 6h: scan for misdiagnosis signals
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── response.ts
│   │   │   └── crypto.ts
│   │   │
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   ├── redis.ts                 # for job queues & caching
│   │   │   └── env.ts
│   │   │
│   │   └── index.ts                     # app entry, WebSocket init
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
│
├── ── ai-service/  ──────────────────────────────────────────────────────────
│   │   (Python + FastAPI — two AI team members own this)
│   │
│   ├── app/
│   │   ├── main.py                      # FastAPI entry point
│   │   │
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── analysis.py          # POST /analyze/symptoms
│   │   │   │   ├── reports.py           # POST /reports/weekly, GET /reports/{id}
│   │   │   │   ├── transcription.py     # POST /transcribe (audio → text)
│   │   │   │   └── risk.py              # POST /risk/evaluate
│   │   │   └── dependencies.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   │
│   │   ├── modules/
│   │   │   │
│   │   │   ├── symptom_analysis/
│   │   │   │   ├── analyzer.py          # LLM-based symptom interpretation
│   │   │   │   ├── trend_detector.py    # detects worsening patterns over time
│   │   │   │   └── severity_scorer.py   # scores 1-10, flags critical
│   │   │   │
│   │   │   ├── misdiagnosis_monitor/    # ← core differentiator
│   │   │   │   ├── monitor.py           # compares new symptoms vs initial diagnosis
│   │   │   │   ├── pattern_matcher.py   # e.g., fatigue+fever+chills → malaria signals
│   │   │   │   └── alert_generator.py   # generates doctor alert with explanation
│   │   │   │
│   │   │   ├── weekly_report/
│   │   │   │   ├── report_builder.py    # aggregates week's logs into summary
│   │   │   │   ├── insight_generator.py # AI recommendations for patient
│   │   │   │   └── doctor_summary.py    # concise summary for doctor to sign
│   │   │   │
│   │   │   ├── transcription/           # Whisper — Jayraj's work area
│   │   │   │   ├── whisper_handler.py   # load & run Whisper model
│   │   │   │   ├── language_detector.py # auto-detect Hindi / English / Marathi
│   │   │   │   ├── multilingual.py      # language-specific post-processing
│   │   │   │   └── conversation_parser.py # extract doctor instructions from transcript
│   │   │   │
│   │   │   └── whatsapp_ai/             # AI brain for WA bot
│   │   │       ├── intent_classifier.py # is message for doctor? urgent? normal log?
│   │   │       ├── data_extractor.py    # pull symptom/biometric data from freetext
│   │   │       └── response_builder.py  # compose WA reply message
│   │   │
│   │   ├── models/                      # saved model weights, tokenizers
│   │   │   ├── whisper/                 # whisper model files (gitignored, download script)
│   │   │   └── .gitkeep
│   │   │
│   │   ├── schemas/                     # Pydantic request/response schemas
│   │   │   ├── symptom.py
│   │   │   ├── report.py
│   │   │   ├── transcription.py
│   │   │   └── risk.py
│   │   │
│   │   └── utils/
│   │       ├── llm_client.py            # OpenAI / Gemini / local LLM wrapper
│   │       ├── prompt_templates.py      # all LLM prompts in one place
│   │       └── text_cleaner.py
│   │
│   ├── scripts/
│   │   └── download_whisper.py          # one-time: pull Whisper weights
│   │
│   ├── tests/
│   │   ├── test_symptom_analysis.py
│   │   ├── test_misdiagnosis.py
│   │   ├── test_transcription.py
│   │   └── test_whatsapp_ai.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
│
├── ── whatsapp-service/  ────────────────────────────────────────────────────
│   │   (Node.js — Shruti's work area)
│   │   Handles Twilio / Meta Cloud API webhook + scheduler
│   │
│   ├── src/
│   │   ├── index.ts                     # Express server
│   │   │
│   │   ├── webhook/
│   │   │   ├── handler.ts               # receives incoming WA messages
│   │   │   ├── verifier.ts              # Twilio/Meta signature verification
│   │   │   └── router.ts               # routes message to correct handler
│   │   │
│   │   ├── handlers/
│   │   │   ├── healthLogHandler.ts      # parses & saves symptom/BP data
│   │   │   ├── doctorMessageHandler.ts  # detects "Dr. X should I…" → forward
│   │   │   └── urgentAlertHandler.ts    # critical keyword → email doctor
│   │   │
│   │   ├── scheduler/
│   │   │   ├── dailyCheckIn.ts          # 8AM daily: "How are you feeling today?"
│   │   │   └── medicationReminder.ts    # dose reminder based on schedule
│   │   │
│   │   ├── services/
│   │   │   ├── twilioClient.ts          # or meta-cloud-api.ts
│   │   │   ├── backendApiClient.ts      # POST data to backend service
│   │   │   └── emailForwarder.ts        # email doctor for urgent messages
│   │   │
│   │   ├── templates/
│   │   │   ├── dailyPrompt.ts           # message templates
│   │   │   ├── urgentAck.ts
│   │   │   └── doctorForwarded.ts
│   │   │
│   │   └── utils/
│   │       ├── intentDetector.ts        # calls ai-service intent classifier
│   │       └── messageParser.ts
│   │
│   ├── tests/
│   │   ├── webhook.test.ts
│   │   └── scheduler.test.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
│
│
└── ── docs/  ────────────────────────────────────────────────────────────────
    ├── architecture.md                  # system design diagram
    ├── api-spec.md                      # REST API reference
    ├── data-models.md                   # DB schema explanation
    ├── ai-pipeline.md                   # how symptom → analysis → alert works
    ├── whatsapp-flow.md                 # WA conversation flow diagrams
    ├── sketches/                        # your notebook images go here
    └── onboarding.md                    # setup guide for each team member
```

---

## Who Owns What

| Area | Owner | Service |
|---|---|---|
| Patient UI, Doctor UI | Frontend dev | `frontend/` |
| REST API, DB, Jobs, Email | Backend dev | `backend/` |
| Symptom AI, Weekly reports, Misdiagnosis monitor | AI dev 1 | `ai-service/modules/symptom_analysis` `misdiagnosis_monitor` `weekly_report` |
| Whisper transcription, WA AI brain | AI dev 2 (Jayraj) | `ai-service/modules/transcription` `whatsapp_ai` |
| WhatsApp bot & scheduler | Shruti | `whatsapp-service/` |

---

## Phase 1 Build Order (Patient Side)

1. **Backend** — auth + patient + symptom + medication + biometric models & routes
2. **Frontend** — dashboard, symptom log, medication log, biometrics chart
3. **AI** — symptom analyzer + severity scorer (no Whisper yet)
4. **WhatsApp** — webhook + daily check-in + health log handler
5. **AI** — misdiagnosis monitor + weekly report
6. **AI** — Whisper integration (Jayraj)
7. **Frontend** — visits/transcript page, AI insights page, doctor messages

---

## Key `.env` Variables (each service has its own)

```
# backend/.env
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
AI_SERVICE_URL=http://ai-service:8000
WHATSAPP_SERVICE_URL=http://whatsapp-service:3001
EMAIL_HOST=
EMAIL_USER=
EMAIL_PASS=
DOCTOR_ALERT_EMAIL=

# ai-service/.env
OPENAI_API_KEY=          # or GEMINI_API_KEY
WHISPER_MODEL_SIZE=base  # base | small | medium
BACKEND_URL=http://backend:3000

# whatsapp-service/.env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
BACKEND_URL=http://backend:3000
AI_SERVICE_URL=http://ai-service:8000
DOCTOR_EMAIL=
```
