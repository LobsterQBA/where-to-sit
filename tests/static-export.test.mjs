import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const inventory = JSON.parse(
  await readFile(new URL("../app/cinema-inventory.json", import.meta.url), "utf8"),
);
const hallIds = inventory.map((hall) => hall.id);

test("exports the English multi-city theater finder", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
  assert.match(html, /See the view\./);
  assert.match(html, /Pick your seat\./);
  assert.match(html, /popcorn-box/);
  assert.match(html, /soda-cup/);
  assert.match(html, />Seattle</);
  assert.match(html, />New York</);
  assert.match(html, />Bay Area</);
  assert.match(html, /PACCAR IMAX/);
  for (const id of hallIds) {
    const route = new URL(`../out/cinema/${id}/index.html`, import.meta.url);
    assert.ok(await readFile(route, "utf8"));
  }
});

test("exports all auditorium simulator routes with estimate boundaries", async () => {
  for (const id of hallIds) {
    const html = await readFile(
      new URL(`../out/cinema/${id}/index.html`, import.meta.url),
      "utf8",
    );
    assert.match(html, /Estimated seat layout/);
    assert.match(html, /Metrics are geometric estimates/);
    assert.match(html, /Seat map/);
    assert.match(html, /Play preview/);
    assert.doesNotMatch(html, /NaN/);
  }
});
