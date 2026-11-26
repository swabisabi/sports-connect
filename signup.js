// Sign-up: about you, then a package. Nothing is charged or stored; the sign-up is sent on WhatsApp.
const PACKAGES = [
  {
    id: "free", name: "Free Community", price: "KES 0", who: "Find your people.",
    perks: ["Join the WhatsApp Community and sport groups", "See verified local listings"],
  },
  {
    id: "basic", name: "Basic Training", price: "KES 300–500 / month",
    who: "For beginners and people who want normal training.",
    perks: ["Access to basic training sessions", "Join available group training", "Connect with other athletes",
      "Access basic training schedules", "Limited coach interaction"],
  },
  {
    id: "advanced", name: "Advanced Training", price: "KES 1,000–1,500 / month",
    who: "For athletes who want to improve their performance.",
    perks: ["Everything in Basic", "Access to more training sessions", "More direct interaction with coaches",
      "Specialised training programmes", "Performance progress tracking", "Priority booking for selected sessions"],
  },
  {
    id: "premium", name: "Premium Training", price: "KES 2,500–4,000 / month",
    who: "For serious athletes and competitive sportspeople.",
    perks: ["Everything in Advanced", "Access to all eligible training sessions", "Personalised training programmes",
      "Priority access to coaches", "More individual coaching attention", "Detailed performance assessments",
      "Advanced progress tracking"],
  },
];

function cleanText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

// What the person still has to fill in, or null when the sign-up is complete.
function signupProblem({ name, ageGroup, sports, packageId }) {
  if (!cleanText(name)) return "Add your name.";
  if (!ageGroup) return "Tick your age group.";
  if (!sports || !sports.length) return "Tick at least one sport.";
  if (!PACKAGES.some((p) => p.id === packageId)) return "Choose a package.";
  return null;
}

function buildSignup(fields) {
  if (signupProblem(fields)) return null;
  const chosen = PACKAGES.find((p) => p.id === fields.packageId);
  const lines = ["Sports Connect sign-up", `Name: ${cleanText(fields.name)}`, `Age group: ${fields.ageGroup}`,
    `Sports: ${fields.sports.join(", ")}`, `Package: ${chosen.name} (${chosen.price})`];
  if (fields.ageGroup.startsWith("Teenager") && chosen.id !== "free") {
    lines.push("Under 18: parent or guardian must agree before any payment");
  }
  return lines.join("\n");
}

async function copyText(box, status) {
  try {
    await navigator.clipboard.writeText(box.value);
    status.textContent = "Copied.";
  } catch (_) {
    box.select();
    status.textContent = "Press and hold the box to copy.";
  }
}

function setupSignup() {
  const form = document.getElementById("intro");
  const status = document.getElementById("status");
  const result = document.getElementById("result");
  const signupBox = document.getElementById("signup-message");
  const introBox = document.getElementById("output");
  const send = document.getElementById("signup-send");

  for (const p of PACKAGES) {
    const perks = el("ul", {}, p.perks.map((perk) => el("li", { textContent: perk })));
    const radio = el("input", { type: "radio", name: "package", value: p.id });
    document.getElementById("packages").append(el("label", { className: "card" }, [
      radio, el("strong", { textContent: p.name }), el("span", { className: "price", textContent: p.price }),
      el("em", { textContent: p.who }), perks,
    ]));
  }

  const community = document.getElementById("community-always");
  const link = communityLink(COMMUNITY_URL);
  if (link) {
    community.href = link;
    community.hidden = false;
  }

  form.addEventListener("input", () => { result.hidden = true; status.textContent = ""; });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const age = form.querySelector("input[name=age]:checked");
    const chosen = form.querySelector("input[name=package]:checked");
    const fields = {
      name: form.elements.who.value,
      ageGroup: age ? age.value : "",
      sports: [...form.querySelectorAll("input[name=sport]:checked")].map((box) => box.value),
      packageId: chosen ? chosen.value : "",
    };
    const text = buildSignup(fields);
    result.hidden = !text;
    status.textContent = text ? "" : signupProblem(fields);
    if (!text) return;
    signupBox.value = text;
    introBox.value = buildIntro(fields);
    const url = bookingLink(BOOKING_NUMBER, text);
    send.hidden = !url;
    if (url) send.href = url;
    document.getElementById("send-help").textContent = url
      ? "Tap the button to send your sign-up to our team."
      : "Copy this and send it privately to a Sports Connect connector. Don't post it in a group.";
    result.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("copy-signup").addEventListener("click",
    () => copyText(signupBox, document.getElementById("signup-status")));
  document.getElementById("copy-intro").addEventListener("click",
    () => copyText(introBox, document.getElementById("intro-status")));
}

if (typeof module !== "undefined") {
  module.exports = { PACKAGES, signupProblem, buildSignup };
} else {
  setupSignup();
}
