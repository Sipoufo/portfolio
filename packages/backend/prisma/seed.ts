// seed.ts
// Idempotent seed transcribed from CV_SIPOUFO_DJIODOM_Loic_Yvan.pdf.
// Re-run safely; each row is upserted on a stable key.

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, SkillCategory } from '@prisma/client';

const prisma = new PrismaClient();

const localized = (fr: string, en: string) => ({ fr, en });

async function main() {
  // ── Profile ────────────────────────────────────────────────────────────
  await prisma.profile.upsert({
    where: { email: 'sipoufoknj@gmail.com' },
    update: {},
    create: {
      name: 'SIPOUFO DJIODOM Loïc Yvan',
      title: localized(
        'Développeur Mobile & Chef de Projet | Full Stack',
        'Mobile Developer & Project Manager | Full Stack',
      ),
      summary: localized(
        "Ingénieur logiciel Bac+5 avec 4 ans d'expérience en développement mobile (Flutter) et backend (SpringBoot, Node.js). Habitué à piloter des projets de bout en bout — conception, développement, déploiement et maintenance — en environnement Agile/Scrum. Autonome, rigoureux et orienté résultats, je recherche une opportunité à l'international pour contribuer à des produits innovants à fort impact.",
        'Software engineer (MSc) with 4 years of experience in mobile development (Flutter) and backend (SpringBoot, Node.js). Used to driving projects end-to-end — design, development, deployment and maintenance — in Agile/Scrum environments. Autonomous, rigorous and results-driven, looking for an international opportunity to contribute to innovative, high-impact products.',
      ),
      email: 'sipoufoknj@gmail.com',
      phone: '+237 6 95 91 49 26',
      location: localized('Douala, Cameroun', 'Douala, Cameroon'),
      socials: {
        github: 'https://github.com/Sipoufo',
        linkedin: 'https://linkedin.com/in/yvansipoufo29',
      },
    },
  });

  // ── Skills ─────────────────────────────────────────────────────────────
  const skills: { category: SkillCategory; name: string; order: number }[] = [
    { category: 'mobile', name: 'Flutter', order: 0 },
    { category: 'mobile', name: 'Dart', order: 1 },
    { category: 'backend', name: 'SpringBoot (Java)', order: 0 },
    { category: 'backend', name: 'Node.js', order: 1 },
    { category: 'backend', name: 'Express.js', order: 2 },
    { category: 'frontend', name: 'Angular', order: 0 },
    { category: 'frontend', name: 'React.js', order: 1 },
    { category: 'frontend', name: 'HTML', order: 2 },
    { category: 'frontend', name: 'CSS', order: 3 },
    { category: 'frontend', name: 'JavaScript', order: 4 },
    { category: 'database', name: 'PostgreSQL', order: 0 },
    { category: 'database', name: 'MySQL', order: 1 },
    { category: 'database', name: 'MongoDB', order: 2 },
    { category: 'devops', name: 'Docker', order: 0 },
    { category: 'devops', name: 'Jenkins', order: 1 },
    { category: 'devops', name: 'Git', order: 2 },
    { category: 'devops', name: 'Bitbucket', order: 3 },
    { category: 'devops', name: 'GitHub', order: 4 },
    { category: 'management', name: 'Jira', order: 0 },
    { category: 'management', name: 'Confluence', order: 1 },
    { category: 'management', name: 'Scrum / Agile', order: 2 },
    { category: 'language', name: 'Français (natif)', order: 0 },
    { category: 'language', name: 'Anglais (B2)', order: 1 },
  ];

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { category_name: { category: s.category, name: s.name } },
      update: { order: s.order },
      create: s,
    });
  }

  // ── Experiences ────────────────────────────────────────────────────────
  const experiences = [
    {
      company: 'Lab2View — Zeney App',
      startDate: '2025-09',
      endDate: null,
      current: true,
      role: localized('Développeur Mobile', 'Mobile Developer'),
      location: localized('Douala, Cameroun', 'Douala, Cameroon'),
      bullets: [
        localized(
          "Développement des modules Authentification & KYC de Zeney, une application fintech de transfert d'argent international (corridors Afrique–Occident).",
          'Built the Authentication & KYC modules of Zeney, a fintech app for international money transfers (Africa ↔ West corridors).',
        ),
        localized(
          "Implémentation de l'onboarding, de la création de compte et de la vérification d'identité (KYC) conforme aux exigences réglementaires.",
          'Implemented onboarding, account creation and the regulatory-compliant identity verification (KYC) flow.',
        ),
        localized(
          'Présentation du MVP lors de la démonstration produit officielle devant les parties prenantes.',
          'Presented the MVP at the official product demo to stakeholders.',
        ),
        localized(
          'Collaboration Agile avec le Lead Mobile et la Product Manager.',
          'Agile collaboration with the Mobile Lead and the Product Manager.',
        ),
      ],
      tech: ['Flutter', 'Dart', 'REST API'],
      order: 0,
    },
    {
      company: 'Lab2View — AfroDiet',
      startDate: '2025-09',
      endDate: null,
      current: true,
      role: localized('Développeur Mobile', 'Mobile Developer'),
      location: localized('Douala, Cameroun', 'Douala, Cameroon'),
      bullets: [
        localized(
          "Développement de l'application mobile AfroDiet (suivi nutritionnel pour patients diabétiques, 1ère app 100% camerounaise).",
          'Built the AfroDiet mobile app (nutritional tracking for diabetic patients, first 100% Cameroonian app of its kind).',
        ),
        localized(
          'Implémentation du calcul automatique des besoins caloriques (IMC, MB, DET via Mifflin-St Jeor), répartition par repas et portions personnalisées.',
          'Implemented automatic caloric needs (BMI, BMR, TDEE via Mifflin-St Jeor), meal split and personalised portions.',
        ),
        localized(
          'Suivi clinique (glycémie, poids, HbA1c) avec graphiques et notifications intelligentes (alertes, félicitations, rappels).',
          'Clinical tracking (glycemia, weight, HbA1c) with charts and smart notifications (alerts, congratulations, reminders).',
        ),
        localized(
          "Intégration d'une base de recettes locales avec filtres et journal alimentaire.",
          'Integrated a local recipes database with filters and a food journal.',
        ),
      ],
      tech: ['Flutter', 'Dart', 'REST API', 'SpringBoot', 'PostgreSQL'],
      order: 1,
    },
    {
      company: 'Freelance — COCOONIN',
      startDate: '2025-01',
      endDate: '2025-08',
      current: false,
      role: localized('Développeur Mobile (Lead)', 'Mobile Developer (Lead)'),
      location: localized('Douala, Cameroun', 'Douala, Cameroon'),
      bullets: [
        localized(
          'Pilotage complet de COCOONIN, conciergerie médicale mobile pour personnes âgées à domicile.',
          'Full ownership of COCOONIN, a mobile medical concierge for seniors at home.',
        ),
        localized(
          'Architecture applicative : rôles (Patient, Aidant, Coordinateur, Médecin) avec RBAC, agenda de coordination, rappels J-3/J-1/J-0.',
          'App architecture: roles (Patient, Caregiver, Coordinator, Doctor) with RBAC, coordination agenda, J-3/J-1/J-0 reminders.',
        ),
        localized(
          'App patient (agenda, documents, profil, consentements) et back-office coordinateur (CRUD patients, RDV, upload, logs).',
          'Patient app (agenda, documents, profile, consents) and coordinator back-office (CRUD patients, appointments, uploads, logs).',
        ),
        localized(
          'Conformité : hébergement HDS recommandé, données minimales, traçabilité des consentements, auto-logout 30 min.',
          'Compliance: HDS-recommended hosting, data minimisation, consent traceability, 30-min auto-logout.',
        ),
      ],
      tech: ['Flutter', 'SpringBoot', 'PostgreSQL', 'Docker', 'SMS/Email API', 'RBAC'],
      order: 2,
    },
    {
      company: "T'S Consulting",
      startDate: '2024-08',
      endDate: '2025-06',
      current: false,
      role: localized('Développeur Logiciel', 'Software Developer'),
      location: localized('Yaoundé, Cameroun', 'Yaoundé, Cameroon'),
      bullets: [
        localized(
          "Développement d'une app mobile de gestion des validations et stocks pour les entreprises du groupe T'S Corporation.",
          "Built a mobile app for approvals and stock management across T'S Corporation entities.",
        ),
        localized(
          'Maintenance et évolution des ERP développés par l\'entreprise.',
          "Maintenance and evolution of the company's in-house ERPs.",
        ),
        localized('Support technique auprès des équipes internes.', 'Technical support for internal teams.'),
      ],
      tech: ['Flutter', 'Angular', 'SpringBoot', 'PostgreSQL'],
      order: 3,
    },
    {
      company: 'Freelance — ChapChapTickets',
      startDate: '2023-11',
      endDate: '2024-02',
      current: false,
      role: localized('Chef de Projet & Développeur SpringBoot', 'Project Manager & SpringBoot Developer'),
      location: localized('Douala, Cameroun', 'Douala, Cameroon'),
      bullets: [
        localized(
          'Pilotage complet du projet : planification, coordination d\'équipe et suivi Scrum.',
          'End-to-end ownership: planning, team coordination, Scrum follow-up.',
        ),
        localized(
          "Conception et développement de l'API REST (SpringBoot) et d'une partie du front (React.js).",
          'Designed and built the REST API (SpringBoot) and part of the React.js front-end.',
        ),
        localized(
          'Base PostgreSQL, déploiement (Docker, Jenkins) et maintenance.',
          'PostgreSQL database, deployment (Docker, Jenkins) and maintenance.',
        ),
        localized(
          "Plateforme d'achat, partage et gestion d'événements et de tickets en ligne.",
          'Online platform to purchase, share and manage events and tickets.',
        ),
      ],
      tech: ['React.js', 'SpringBoot', 'PostgreSQL', 'Docker', 'Jenkins', 'Scrum'],
      order: 4,
    },
    {
      company: 'Freelance — CRM Forage',
      startDate: '2022-05',
      endDate: '2023-04',
      current: false,
      role: localized('Chef de Projet & Développeur Node.js', 'Project Manager & Node.js Developer'),
      location: localized('Douala, Cameroun', 'Douala, Cameroon'),
      bullets: [
        localized(
          "Développement d'une application de gestion et de suivi clientèle pour un forage.",
          'Built a customer management and tracking app for a drilling company.',
        ),
        localized(
          'Réduction des coûts opérationnels de 50 % et du temps de traitement des commandes de 30 %.',
          '50% operational cost reduction and 30% faster order processing.',
        ),
        localized(
          "Conception de l'API RESTful (Node.js), documentation Swagger et interface cliente (Laravel).",
          'Designed the RESTful API (Node.js), Swagger documentation and client UI (Laravel).',
        ),
      ],
      tech: ['Node.js', 'Laravel', 'PostgreSQL', 'Docker', 'Swagger'],
      order: 5,
    },
  ];

  for (const e of experiences) {
    await prisma.experience.upsert({
      where: { company_startDate: { company: e.company, startDate: e.startDate } },
      update: { ...e, bullets: e.bullets, role: e.role, location: e.location },
      create: e,
    });
  }

  // ── Education ──────────────────────────────────────────────────────────
  const education = [
    {
      school: 'UCAC-ICAM',
      startDate: '2019-09',
      endDate: '2024-06',
      degree: localized(
        "Diplôme d'Ingénieur en Informatique (Bac+5)",
        'Computer Engineering Degree (MSc equivalent)',
      ),
      location: localized('Douala, Cameroun', 'Douala, Cameroon'),
      order: 0,
    },
    {
      school: 'Lycée Classique de Bafoussam',
      startDate: '2018-09',
      endDate: '2019-06',
      degree: localized(
        'Baccalauréat Technologique Informatique (TI)',
        'Technological Baccalaureate in Computer Science',
      ),
      location: localized('Bafoussam, Cameroun', 'Bafoussam, Cameroon'),
      order: 1,
    },
  ];

  for (const ed of education) {
    await prisma.education.upsert({
      where: { school_startDate: { school: ed.school, startDate: ed.startDate } },
      update: ed,
      create: ed,
    });
  }

  // ── Interests ──────────────────────────────────────────────────────────
  const interests = [
    { label: localized('Basketball', 'Basketball'), order: 0 },
    { label: localized('Natation', 'Swimming'), order: 1 },
    { label: localized('Lecture', 'Reading'), order: 2 },
    { label: localized('Développement personnel', 'Personal development'), order: 3 },
  ];

  // Interests have no natural unique key, so we clear + recreate from scratch
  // (idempotent for our purposes since the list is small and authoritative).
  await prisma.interest.deleteMany();
  for (const it of interests) {
    await prisma.interest.create({ data: it });
  }

  // ── Admin user ─────────────────────────────────────────────────────────
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {},
      create: { email: process.env.ADMIN_EMAIL, passwordHash },
    });
  }

  // eslint-disable-next-line no-console
  console.log('[seed] done');
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
