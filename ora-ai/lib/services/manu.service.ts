// ============================================================
// MANU — Service Recrutement
// Publie les offres d'emploi, collecte et trie les candidatures,
// score les CV par IA et planifie les entretiens
// ============================================================

import type { Task, ApiResponse } from "@/lib/types";

// ------------------------------------------------------------
// Types locaux
// ------------------------------------------------------------

export interface JobOffer {
  title: string;
  description: string;
  sector: string;
  location: string;
  contractType: "CDI" | "CDD" | "stage" | "freelance" | "alternance";
  salary?: string;
  skills: string[];
  experience?: string;
  remote: boolean;
  publishedAt?: string;
  closingAt?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  coverLetter?: string;
  linkedinUrl?: string;
  appliedAt: string;
  jobOfferId: string;
}

export interface CandidateScore {
  candidateId: string;
  score: number;           // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendation: "shortlist" | "maybe" | "reject";
  summary: string;
}

export interface InterviewSlot {
  candidateId: string;
  date: string;            // ISO 8601
  duration: number;        // en minutes
  format: "presentiel" | "visio" | "telephone";
  meetLink?: string;
  confirmedAt?: string;
}

export interface ManuConfig {
  userId: string;
  entreprise: string;
  sector: string;
  location: string;
  linkedinPageId?: string;
  calendarId?: string;     // Google Calendar ID pour les entretiens
  notifyEmail?: string;    // email pour les alertes nouvelles candidatures
}

// ------------------------------------------------------------
// Génération d'offre d'emploi (Claude API / OpenAI)
// ------------------------------------------------------------

/**
 * Génère une offre d'emploi optimisée pour attirer des candidats
 * sur le marché polynésien.
 * À connecter à Claude API ou OpenAI.
 */
export async function generateJobOffer(
  config: ManuConfig,
  title: string,
  skills: string[],
  contractType: JobOffer["contractType"] = "CDI"
): Promise<ApiResponse<JobOffer>> {
  // TODO: appel réel à l'API IA
  // const response = await anthropic.messages.create({
  //   model: "claude-3-5-sonnet-20241022",
  //   system: buildRecruitmentSystemPrompt(config),
  //   messages: [{ role: "user", content: buildJobPrompt(title, skills, contractType) }],
  // });

  const mockOffer: JobOffer = {
    title,
    description:
      "Ia ora na ! " +
      config.entreprise +
      " recherche un(e) " +
      title +
      " passionné(e) pour rejoindre notre équipe dynamique au fenua. " +
      "Vous évoluerez dans un environnement stimulant et contribuerez au développement de notre activité en Polynésie française. " +
      "Nous valorisons l'authenticité, le savoir-faire local et l'esprit d'équipe. " +
      "Mauruuru de votre intérêt pour nous rejoindre ! 🌺",
    sector: config.sector,
    location: config.location,
    contractType,
    salary: "À définir selon profil",
    skills,
    experience: "1 à 3 ans souhaité",
    remote: false,
    publishedAt: new Date().toISOString(),
    closingAt: new Date(Date.now() + 30 * 86_400_000).toISOString(), // +30 jours
  };

  return { success: true, data: mockOffer };
}

// ------------------------------------------------------------
// Publication de l'offre (LinkedIn / Facebook Jobs)
// ------------------------------------------------------------

/**
 * Publie une offre d'emploi sur LinkedIn via l'API Jobs.
 * Nécessite : LINKEDIN_ACCESS_TOKEN + LINKEDIN_ORGANIZATION_ID
 */
export async function publishToLinkedIn(
  offer: JobOffer,
  organizationId: string
): Promise<ApiResponse<{ jobPostingId: string; url: string }>> {
  // TODO: appel réel à l'API LinkedIn Jobs
  // const res = await fetch("https://api.linkedin.com/v2/jobPostings", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: "Bearer " + accessToken,
  //     "X-Restli-Protocol-Version": "2.0.0",
  //   },
  //   body: JSON.stringify({
  //     companyApplyUrl: { url: applyUrl },
  //     description: { text: offer.description },
  //     employmentStatus: "FULL_TIME",
  //     externalJobPostingId: "ora_" + Date.now(),
  //     listedAt: Date.now(),
  //     jobPostingOperationType: "CREATE",
  //     title: offer.title,
  //     location: { countryCode: "PF", city: offer.location },
  //   }),
  // });

  console.log("[Manu] LinkedIn job post:", offer.title);

  return {
    success: true,
    data: {
      jobPostingId: "li_" + Date.now(),
      url: "https://www.linkedin.com/jobs/view/li_mock_" + Date.now(),
    },
  };
}

/**
 * Publie une offre d'emploi sur Facebook Jobs.
 * Nécessite : FACEBOOK_PAGE_ACCESS_TOKEN + PAGE_ID
 */
export async function publishToFacebook(
  offer: JobOffer,
  pageId: string
): Promise<ApiResponse<{ postId: string }>> {
  // TODO: appel réel à l'API Facebook Jobs
  // const res = await fetch(
  //   "https://graph.facebook.com/" + pageId + "/jobs",
  //   {
  //     method: "POST",
  //     headers: { Authorization: "Bearer " + pageAccessToken },
  //     body: JSON.stringify({
  //       job_title: offer.title,
  //       job_description: offer.description,
  //       location: { city: offer.location, country: "PF" },
  //     }),
  //   }
  // );

  console.log("[Manu] Facebook job post:", offer.title);

  return { success: true, data: { postId: "fb_job_" + Date.now() } };
}

// ------------------------------------------------------------
// Scoring IA des candidatures
// ------------------------------------------------------------

/**
 * Analyse et score un CV candidat par rapport à l'offre d'emploi.
 * Utilise l'IA pour extraire les compétences et évaluer l'adéquation.
 * À connecter à Claude API (vision + texte).
 */
export async function scoreCandidate(
  candidate: Candidate,
  offer: JobOffer
): Promise<ApiResponse<CandidateScore>> {
  // TODO: appel réel à l'API IA avec lecture du PDF CV
  // const cvContent = await extractCvText(candidate.cvUrl);
  // const response = await anthropic.messages.create({
  //   model: "claude-3-5-sonnet-20241022",
  //   system: buildScoringSystemPrompt(),
  //   messages: [{
  //     role: "user",
  //     content: buildScoringPrompt(cvContent, offer),
  //   }],
  // });

  // Score mock basé sur le nombre de skills correspondantes
  const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100
  const recommendation: CandidateScore["recommendation"] =
    mockScore >= 80 ? "shortlist" : mockScore >= 65 ? "maybe" : "reject";

  return {
    success: true,
    data: {
      candidateId: candidate.id,
      score: mockScore,
      strengths: [
        "Expérience locale en Polynésie française",
        "Compétences techniques solides",
        "Bonne présentation du dossier",
      ],
      weaknesses: [
        "Quelques compétences requises à développer",
      ],
      recommendation,
      summary:
        "Profil " +
        (recommendation === "shortlist"
          ? "très intéressant"
          : recommendation === "maybe"
          ? "à considérer"
          : "insuffisant") +
        " pour le poste de " +
        offer.title +
        ". Score global : " +
        mockScore +
        "/100.",
    },
  };
}

// ------------------------------------------------------------
// Planification des entretiens (Google Calendar)
// ------------------------------------------------------------

/**
 * Crée un événement d'entretien dans Google Calendar
 * et envoie une invitation au candidat.
 * Nécessite : GOOGLE_CALENDAR_SERVICE_ACCOUNT dans .env
 */
export async function scheduleInterview(
  slot: InterviewSlot,
  candidate: Candidate,
  calendarId: string
): Promise<ApiResponse<{ eventId: string; meetLink?: string }>> {
  // TODO: appel réel à Google Calendar API
  // const calendar = google.calendar({ version: "v3", auth });
  // const event = await calendar.events.insert({
  //   calendarId,
  //   sendUpdates: "all",
  //   resource: {
  //     summary: "Entretien — " + candidate.name,
  //     description: "Entretien pour le poste : " + slot.candidateId,
  //     start: { dateTime: slot.date },
  //     end: { dateTime: addMinutes(slot.date, slot.duration) },
  //     attendees: [{ email: candidate.email }],
  //     conferenceData: slot.format === "visio" ? { createRequest: { requestId: "meet_" + Date.now() } } : undefined,
  //   },
  // });

  const meetLink =
    slot.format === "visio"
      ? "https://meet.google.com/mock-" + Math.random().toString(36).substring(2, 8)
      : undefined;

  console.log("[Manu] Entretien planifié pour", candidate.name, "le", slot.date);

  return {
    success: true,
    data: {
      eventId: "evt_" + Date.now(),
      meetLink,
    },
  };
}

// ------------------------------------------------------------
// Relance automatique des candidats (email / WhatsApp)
// ------------------------------------------------------------

/**
 * Envoie un message de relance ou de confirmation au candidat.
 * À connecter à un service email (Resend / SendGrid) ou WhatsApp.
 */
export async function notifyCandidate(
  candidate: Candidate,
  type: "received" | "shortlisted" | "interview_invite" | "rejected",
  details?: { date?: string; meetLink?: string }
): Promise<ApiResponse<{ sent: boolean }>> {
  // TODO: appel réel à Resend API ou WhatsApp
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "recrutement@ora-ai.pf",
  //   to: candidate.email,
  //   subject: buildSubject(type),
  //   html: buildEmailTemplate(type, candidate, details),
  // });

  const messages = {
    received: "Ia ora na " + candidate.name + " ! Nous avons bien reçu votre candidature. Mauruuru ! 🌺",
    shortlisted: "Bonne nouvelle ! Votre profil a été sélectionné. Nous reviendrons vers vous très prochainement.",
    interview_invite:
      "Nous souhaitons vous rencontrer ! Entretien prévu le " +
      (details?.date ?? "date à confirmer") +
      (details?.meetLink ? " — Lien : " + details.meetLink : "") +
      ".",
    rejected:
      "Ia ora na " +
      candidate.name +
      ". Après étude de votre candidature, nous ne donnons pas suite cette fois. Mauruuru pour votre intérêt. 🙏",
  };

  console.log("[Manu] Notification →", candidate.email, ":", messages[type].substring(0, 60));

  return { success: true, data: { sent: true } };
}

// ------------------------------------------------------------
// Builder de tâche
// ------------------------------------------------------------

export function buildManuTask(
  offer: JobOffer,
  action: "job_post" | "cv_analysis",
  userId: string,
  platform: "linkedin" | "facebook" = "linkedin"
): Omit<Task, "id"> {
  return {
    agentId: "manu",
    type: action,
    status: "success",
    platform,
    title:
      action === "job_post"
        ? "Offre publiée : " + offer.title
        : "Analyse CV — " + offer.title,
    scheduledAt: offer.publishedAt,
    executedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    metadata: {
      userId,
      jobTitle: offer.title,
      sector: offer.sector,
      location: offer.location,
      contractType: offer.contractType,
      skills: offer.skills,
    },
  };
}
