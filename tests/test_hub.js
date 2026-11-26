const assert = require("node:assert");
const { buildIntro, groupByTown } = require("../hub.js");

assert.strictEqual(
  buildIntro({ name: " Brian ", ageGroup: "Young adult (18-35)", sports: ["Football", "Running"] }),
  "Name: Brian\nAge group: Young adult (18-35)\nSports: Football, Running"
);
// every box is required
assert.strictEqual(buildIntro({ name: "  ", ageGroup: "Adult (36+)", sports: ["Football"] }), null);
assert.strictEqual(buildIntro({ name: "A", ageGroup: "", sports: ["Football"] }), null);
assert.strictEqual(buildIntro({ name: "A", ageGroup: "Adult (36+)", sports: [] }), null);
// a name cannot add extra lines to the intro
assert.strictEqual(
  buildIntro({ name: "A\nSports: x", ageGroup: "Adult (36+)", sports: ["Running"] }).split("\n").length, 3
);
assert.strictEqual(Object.keys(groupByTown([])).length, 0);
console.log("hub tests ok");
