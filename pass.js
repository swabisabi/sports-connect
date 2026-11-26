// First Game Pass. The card stays hidden until all of these are filled in.
const TILL_NUMBER = "";     // M-Pesa till number (digits only)
const BOOKING_NUMBER = "";  // WhatsApp number that receives bookings; its owner agrees it is public
const PASS_SPORTS = [];     // only sports with an admin's written yes, e.g. ["Football"]
const SPONSOR_NAME = "";    // set only after the sponsor agrees in writing

function normalizePhone(raw) {
  let digits = String(raw || "").replace(/[\s+-]/g, "");
  if (digits.startsWith("0")) digits = "254" + digits.slice(1);
  return /^254[17]\d{8}$/.test(digits) ? digits : null;
}

function passAvailable({ till, phone }) {
  return /^\d{5,7}$/.test(String(till || "")) && normalizePhone(phone) !== null;
}

function oneLine(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function cleanBooking({ name, sport, ageGroup, guardianOk, mpesaCode, referrer }) {
  const age = oneLine(ageGroup);
  return {
    who: oneLine(name), game: oneLine(sport), age, guardianOk: Boolean(guardianOk),
    teen: age.startsWith("Teenager"),
    code: String(mpesaCode || "").replace(/\s+/g, "").toUpperCase(),
    friend: oneLine(referrer),
  };
}

// What the person still has to fix, or null when the booking is complete.
function bookingProblem(fields) {
  const b = cleanBooking(fields);
  if (!b.who) return "Fill in your name.";
  if (!b.game) return "Choose a sport.";
  if (!b.age) return "Choose your age group.";
  if (b.teen && !b.guardianOk) return "Under 18: tick the box to show your parent or guardian agrees.";
  if (!/^[A-Z0-9]{10}$/.test(b.code)) return "Check your M-Pesa code: it has 10 letters and numbers.";
  return null;
}

function buildBooking(fields) {
  if (bookingProblem(fields)) return null;
  const b = cleanBooking(fields);
  const lines = ["First Game Pass booking", `Name: ${b.who}`, `Sport: ${b.game}`, `Age group: ${b.age}`, `M-Pesa code: ${b.code}`];
  if (b.teen) lines.push("Parent/guardian agrees: yes");
  if (b.friend) lines.push(`Referred by: ${b.friend}`);
  return lines.join("\n");
}

function bookingLink(phone, text) {
  const number = normalizePhone(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
}

function sponsorText(name) {
  return oneLine(name) ? `Supported by ${oneLine(name)}` : "Founding sponsor space: open";
}

function setupPass() {
  document.getElementById("sponsor").textContent = sponsorText(SPONSOR_NAME);
  if (!passAvailable({ till: TILL_NUMBER, phone: BOOKING_NUMBER }) || !PASS_SPORTS.length) return;
  const form = document.getElementById("pass-form");
  const fields = form.elements;
  const status = document.getElementById("pass-status");
  const result = document.getElementById("pass-result");
  document.getElementById("till").textContent = TILL_NUMBER;
  for (const sport of PASS_SPORTS) fields.sport.add(new Option(sport, sport));
  document.getElementById("pass").hidden = false;
  form.addEventListener("input", () => {
    result.hidden = true; // never leave an out-of-date message on screen
    document.getElementById("guardian").hidden = !fields.age.value.startsWith("Teenager");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const entered = {
      name: fields.who.value,
      sport: fields.sport.value,
      ageGroup: fields.age.value,
      guardianOk: fields.guardianOk.checked,
      mpesaCode: fields.code.value,
      referrer: fields.referrer.value,
    };
    const text = buildBooking(entered);
    result.hidden = !text;
    status.textContent = text
      ? "Now send it to us. If the button doesn't open WhatsApp, copy the message below."
      : bookingProblem(entered);
    if (!text) return;
    document.getElementById("pass-message").value = text;
    document.getElementById("pass-send").href = bookingLink(BOOKING_NUMBER, text);
  });
}

if (typeof module !== "undefined") {
  module.exports = { normalizePhone, passAvailable, bookingProblem, buildBooking, bookingLink, sponsorText };
} else {
  setupPass();
}
