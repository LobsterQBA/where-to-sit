import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const inventory = JSON.parse(
  await readFile(new URL("../app/cinema-inventory.json", import.meta.url), "utf8"),
);
const seatLayouts = JSON.parse(
  await readFile(new URL("../app/seat-layouts.json", import.meta.url), "utf8"),
);
const experienceSource = await readFile(
  new URL("../app/CinemaExperience.tsx", import.meta.url),
  "utf8",
);
const sceneSource = await readFile(
  new URL("../app/CinemaScene.tsx", import.meta.url),
  "utf8",
);

test("contains the 20 launch theaters across three markets", () => {
  assert.equal(inventory.length, 20);
  assert.deepEqual(
    Object.fromEntries(
      ["Seattle Metro", "NYC Metro", "SF Bay Area"].map((city) => [
        city,
        inventory.filter((hall) => hall.city === city).length,
      ]),
    ),
    { "Seattle Metro": 7, "NYC Metro": 7, "SF Bay Area": 6 },
  );
  assert.equal(new Set(inventory.map((hall) => hall.id)).size, 20);
  assert.equal(inventory.every((hall) => /^https:\/\//.test(hall.sourceUrl)), true);
});

test("uses verified PACCAR screen dimensions and no borrowed seat maps", () => {
  const paccar = inventory.find((hall) => hall.id === "paccar-imax");
  assert.equal(paccar.width, 18.288);
  assert.equal(paccar.height, 11.278);
  assert.deepEqual(seatLayouts.layouts, {});
});

test("keeps unknown commercial-auditorium dimensions unknown in source data", () => {
  const commercial = inventory.filter((hall) => hall.id !== "paccar-imax");
  assert.equal(commercial.every((hall) => hall.width === null), true);
  assert.equal(commercial.every((hall) => /^https:\/\//.test(hall.sourceUrl)), true);
});

test("keeps every newly added room layout estimated", () => {
  const newMarkets = inventory.filter((hall) => hall.city !== "Seattle Metro");
  assert.equal(newMarkets.length, 13);
  assert.equal(
    newMarkets.every(
      (hall) => hall.width === null && hall.height === null && hall.seats === null,
    ),
    true,
  );
});

test("keeps the selected-seat 3D camera active on compact screens", () => {
  assert.match(experienceSource, /<CinemaScene/);
  assert.doesNotMatch(experienceSource, /StaticAuditoriumPreview/);
  assert.match(sceneSource, /selectedSeat\.x/);
  assert.match(sceneSource, /getSeatEyeY\(selectedSeat\)/);
  assert.match(sceneSource, /selectedSeat\.z/);
});
