import { chromium } from "/Users/lobster/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const outputDir = process.argv[2];
if (!outputDir) {
  throw new Error("Usage: node record-social-demo.mjs <output-dir>");
}

const browser = await chromium.launch({
  headless: false,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--use-angle=metal",
    "--autoplay-policy=no-user-gesture-required",
  ],
});

const context = await browser.newContext({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
  geolocation: { latitude: 47.6062, longitude: -122.3321 },
  permissions: ["geolocation"],
  colorScheme: "dark",
  recordVideo: {
    dir: outputDir,
    size: { width: 1080, height: 1920 },
  },
});

const page = await context.newPage();
const hold = (milliseconds) => page.waitForTimeout(milliseconds);

await page.goto("https://www.leozhao.me/projects/where-to-sit", {
  waitUntil: "domcontentloaded",
});
await page.waitForLoadState("load");
await hold(4500);

await page
  .getByRole("button", {
    name: "Use my location and sort theaters by distance",
    exact: true,
  })
  .click();
await hold(4500);

const paccarLink = page.locator('a[href$="/cinema/paccar-imax/"]');
if ((await paccarLink.count()) !== 1) {
  throw new Error(`Expected one PACCAR link, found ${await paccarLink.count()}`);
}
await paccarLink.scrollIntoViewIfNeeded();
await hold(2500);
await paccarLink.click();
await page.waitForLoadState("load");
await hold(5000);

await page.getByRole("button", { name: "Row A, seat 1", exact: true }).click();
await hold(5500);

await page.getByRole("button", { name: "Row E, seat 9", exact: true }).click();
await hold(4500);

await page.getByRole("button", { name: "Row I, seat 18", exact: true }).click();
await hold(5500);

await page.getByRole("button", { name: "Row E, seat 9", exact: true }).click();
await hold(3500);

await page.getByRole("button", { name: "Play preview: Seattle test reel", exact: true }).click();
await hold(8000);

const lightsButton = page.getByRole("button", { name: "Turn lights off", exact: true });
if (await lightsButton.isVisible()) {
  await lightsButton.click();
  await hold(4500);
}

const video = page.video();
await context.close();
const videoPath = await video.path();
await browser.close();
console.log(videoPath);
