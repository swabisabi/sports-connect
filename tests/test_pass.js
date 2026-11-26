const assert = require("node:assert");
const p = require("../pass.js");
const base = { name: "Brian", sport: "Football", ageGroup: "Young adult (18-35)", mpesaCode: "qab1c2d3e4" };

for (const raw of ["0712 000 000", "+254712000000", "254-712-000-000"])
  assert.strictEqual(p.normalizePhone(raw), "254712000000");
assert.strictEqual(p.normalizePhone("0112000000"), "254112000000");
for (const raw of ["", "12345", "0812000000", "07120000001"]) assert.strictEqual(p.normalizePhone(raw), null);

assert.strictEqual(p.passAvailable({ till: "", phone: "0712000000" }), false);
assert.strictEqual(p.passAvailable({ till: "123456", phone: "" }), false);
assert.strictEqual(p.passAvailable({ till: "123456", phone: "0712000000" }), true);

assert.strictEqual(p.buildBooking({ ...base, referrer: "Amina" }),
  "First Game Pass booking\nName: Brian\nSport: Football\nAge group: Young adult (18-35)\nM-Pesa code: QAB1C2D3E4\nReferred by: Amina");
for (const key of ["name", "sport", "ageGroup", "mpesaCode"])
  assert.strictEqual(p.buildBooking({ ...base, [key]: "" }), null);
assert.strictEqual(p.buildBooking({ ...base, mpesaCode: "abc" }), null);
const teen = { ...base, ageGroup: "Teenager (13-17)" };
assert.strictEqual(p.buildBooking(teen), null);
assert.ok(p.buildBooking({ ...teen, guardianOk: true }).includes("Parent/guardian agrees: yes"));
assert.strictEqual(p.buildBooking({ ...base, name: "A\nSport: x" }).split("\n").length, 5);

const link = p.bookingLink("0712000000", "A & B #1 100%\nx");
assert.strictEqual(link, "https://wa.me/254712000000?text=A%20%26%20B%20%231%20100%25%0Ax");
assert.strictEqual(p.bookingLink("bad", "x"), null);

assert.strictEqual(p.sponsorText(""), "Founding sponsor space: open");
assert.strictEqual(p.sponsorText(" Acme "), "Supported by Acme");
// the prompt says exactly what to fix
assert.strictEqual(p.bookingProblem(base), null);
assert.strictEqual(p.bookingProblem({ ...base, name: "" }), "Fill in your name.");
assert.strictEqual(p.bookingProblem({ ...base, sport: "" }), "Choose a sport.");
assert.strictEqual(p.bookingProblem({ ...base, ageGroup: "" }), "Choose your age group.");
assert.strictEqual(p.bookingProblem({ ...base, mpesaCode: "abc" }), "Check your M-Pesa code: it has 10 letters and numbers.");
assert.strictEqual(p.bookingProblem(teen), "Under 18: tick the box to show your parent or guardian agrees.");
// a code pasted with spaces still works
assert.ok(p.buildBooking({ ...base, mpesaCode: " qab1c 2d3e4 " }).includes("M-Pesa code: QAB1C2D3E4"));
// under-18s see the guardian rule before the payment instruction
const html = require("node:fs").readFileSync(require("node:path").join(__dirname, "../index.html"), "utf8");
assert.ok(html.indexOf("Under 18? Do not pay") > 0 && html.indexOf("Under 18? Do not pay") < html.indexOf("Pay to till"));
assert.ok(!/name="code"[^>]*maxlength="10"/.test(html));
console.log("pass tests ok");
