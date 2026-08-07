import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const hallIds = [
  "paccar-imax",
  "amc-alderwood",
  "amc-kent-station",
  "amc-southcenter",
  "regal-thornton-place",
  "regal-issaquah",
  "cinemark-lincoln-square",
];

test("exports the English Seattle theater finder", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
  assert.match(html, /See the view\./);
  assert.match(html, /Pick your seat\./);
  assert.match(html, /popcorn-box/);
  assert.match(html, /soda-cup/);
  assert.match(html, /Seattle Metro/);
  assert.match(html, /PACCAR IMAX/);
  for (const id of hallIds) assert.match(html, new RegExp(`/cinema/${id}/`));
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
  }
});
