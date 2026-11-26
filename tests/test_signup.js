const assert = require("node:assert");
const s = require("../signup.js");

assert.deepStrictEqual(s.PACKAGES.map((p) => [p.name, p.price]), [
  ["Free Community", "KES 0"],
  ["Basic Training", "KES 300–500 / month"],
  ["Advanced Training", "KES 1,000–1,500 / month"],
  ["Premium Training", "KES 2,500–4,000 / month"],
]);

const base = { name: " Brian ", ageGroup: "Young adult (18-35)", sports: ["Football", "Running"], packageId: "advanced" };
assert.strictEqual(s.signupProblem(base), null);
assert.strictEqual(s.buildSignup(base),
  "Sports Connect sign-up\nName: Brian\nAge group: Young adult (18-35)\nSports: Football, Running\nPackage: Advanced Training (KES 1,000–1,500 / month)");
assert.strictEqual(s.signupProblem({ ...base, name: " " }), "Add your name.");
assert.strictEqual(s.signupProblem({ ...base, ageGroup: "" }), "Tick your age group.");
assert.strictEqual(s.signupProblem({ ...base, sports: [] }), "Tick at least one sport.");
assert.strictEqual(s.signupProblem({ ...base, packageId: "gold" }), "Choose a package.");
assert.strictEqual(s.buildSignup({ ...base, packageId: "" }), null);
const teen = { ...base, ageGroup: "Teenager (13-17)" };
assert.ok(s.buildSignup(teen).endsWith("Under 18: parent or guardian must agree before any payment"));
assert.ok(!s.buildSignup({ ...teen, packageId: "free" }).includes("payment"));
assert.strictEqual(s.buildSignup({ ...base, name: "A\nPackage: x" }).split("\n").length, 5);
console.log("signup tests ok");
