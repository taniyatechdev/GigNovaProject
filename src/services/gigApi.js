
const API_URL =
  "https://remotive.com/api/remote-jobs?limit=100";

const LOCAL_GIGS_KEY = "gignova_local_gigs";

const DEMO_GIGS = [
  {
    id: "demo-1",
    title: "Build a Responsive React Website",
    category: "Web Development",
    description:
      "Looking for a React developer to build a responsive website with reusable components.",
    skills: "React, JavaScript, HTML, CSS",
    budget: "₹15,000",
    experience: "Intermediate",
    paymentType: "fixed",
    status: "open",
    source: "demo",
  },
  {
    id: "demo-2",
    title: "Design a Modern Brand Logo",
    category: "Graphic Design",
    description:
      "Need a creative designer to develop a professional logo and brand identity.",
    skills: "Figma, Illustrator, Photoshop",
    budget: "₹5,000",
    experience: "Beginner",
    paymentType: "fixed",
    status: "open",
    source: "demo",
  },
  {
    id: "demo-3",
    title: "Create SEO Blog Content",
    category: "Content Writing",
    description:
      "Looking for a content writer to create engaging and search-optimized blog articles.",
    skills: "SEO, Blog Writing, Research",
    budget: "₹8,000",
    experience: "Intermediate",
    paymentType: "fixed",
    status: "open",
    source: "demo",
  },
];

// Read gigs saved in localStorage
function getLocalGigs() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(LOCAL_GIGS_KEY) || "[]"
    );

    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.error("Error loading local gigs:", error);
    return [];
  }
}

// Save a gig locally
export function saveLocalGig(gig) {
  const gigs = getLocalGigs();

  const exists = gigs.some(
    (item) => String(item.id) === String(gig.id)
  );

  const updated = exists
    ? gigs.map((item) =>
        String(item.id) === String(gig.id) ? gig : item
      )
    : [gig, ...gigs];

  localStorage.setItem(
    LOCAL_GIGS_KEY,
    JSON.stringify(updated)
  );

  return gig;
}

// Fetch suggestions from Remotive API
export async function fetchGigSuggestions() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(
      `Remotive API error: ${response.status}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.jobs)) {
    throw new Error("Invalid Remotive API response");
  }

  return data.jobs.map((job) => {
    const plainDescription = String(
      job.description || ""
    )
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const tags = Array.isArray(job.tags)
      ? job.tags.filter(
          (tag) => typeof tag === "string"
        )
      : [];

    return {
      id: `remotive-${job.id}`,
      title: job.title || "Remote Job",
      category: job.category || "Other",
      description: plainDescription,
      skills: tags,
      company: job.company_name || "Remote Company",
      salary: job.salary || "",
      url: job.url || "",
      source: "remotive",
    };
  });
}

// Fetch all gigs for Browse Gigs page
export async function fetchAllGigs() {
  const localGigs = getLocalGigs();

  try {
    const apiJobs = await fetchGigSuggestions();

    const remoteGigs = apiJobs.map((job) => ({
      ...job,
      skills: job.skills.join(", "),
      budget: job.salary || "Not specified",
      paymentType: "fixed",
      experience: "Not specified",
      status: "open",
      source: "remotive",
    }));

    return [
      ...localGigs,
      ...DEMO_GIGS,
      ...remoteGigs,
    ];
  } catch (error) {
    console.warn(
      "Remotive API unavailable, using local and demo gigs.",
      error
    );

    return [
      ...localGigs,
      ...DEMO_GIGS,
    ];
  }
}
