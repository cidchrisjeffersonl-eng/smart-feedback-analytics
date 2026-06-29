// ============================================================
// SITE CONTENT CONFIG
// Edit everything here — title, hero slides, objectives,
// modules, footer info. No need to touch any component files.
// Image URLs are placeholders (Unsplash) — swap with your own.
// ============================================================

export const siteContent = {
  schoolName: "Smart Feedback Analytics", // TODO: replace with your final system name

  nav: {
    links: ["About", "Objectives", "Features", "Team"],
  },

  hero: {
    slides: [
      {
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80",
        headline: "Smart Feedback Analytics for Faculty Evaluation",
        subtext:
          "An NLP-powered system that turns raw student feedback into actionable insight — automatically.",
      },
      {
        image:
          "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=80",
        headline: "Real-Time Sentiment Analysis & Thematic Categorization",
        subtext:
          "Every comment is automatically scored and tagged by theme — clarity, engagement, fairness, and more.",
      },
      {
        image:
          "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&q=80",
        headline: "AI-Assisted Intervention Recommendations",
        subtext:
          "When feedback trends turn negative, the system flags it and suggests a concrete action plan.",
      },
    ],
    ctaText: "Log In",
  },

  // Repurposed as "Project Objectives"
  programs: [
    {
      icon: "🎯",
      title: "General Objective",
      description:
        "To design and develop a web-based system that automates the collection, analysis, and reporting of student feedback for faculty evaluation using NLP and sentiment analysis.",
      link: "#objectives",
    },
    {
      icon: "📊",
      title: "Specific Objectives",
      description:
        "Automatically classify feedback sentiment and theme; generate real-time analytics dashboards per role; and flag at-risk faculty performance trends for early intervention.",
      link: "#objectives",
    },
  ],

  // Repurposed as "Core Modules"
  campuses: [
    {
      name: "Sentiment & Theme Engine",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      link: "#features",
    },
    {
      name: "Role-Based Dashboards",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      link: "#features",
    },
    {
      name: "AI Intervention System",
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
      link: "#features",
    },
  ],

  cta: {
    headline: "Built for Students, Faculty, and Academic Leaders",
    subtext:
      "Submit feedback, monitor performance trends, and act on insights — all in one platform.",
    buttonText: "Get Started",
  },

  footer: {
    address:
      "Capstone Project — BS Information Technology, FEU Roosevelt Marikina City", // TODO: replace
    phone: "Developed by Chris Jefferson Cid", // TODO: replace with your info
    email: "cidchrisjeffersonl@gmail.com", // TODO: replace
    socials: ["GitHub", "LinkedIn"],
  },
};
