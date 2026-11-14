#!/usr/bin/env node
/**
 * Internet download speed test: 10 sequential requests to a given URL.
 */

"use strict";

const REQUEST_COUNT = 10;

async function fetchFull(url) {
  const start = performance.now();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const elapsed = (performance.now() - start) / 1000;
  return { elapsed, size: buffer.length };
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node speed_test.js <url>");
    process.exit(1);
  }

  const times = [];
  let totalBytes = 0;

  console.log(`URL: ${url}`);
  console.log(`Requests: ${REQUEST_COUNT} (sequential)\n`);

  for (let i = 1; i <= REQUEST_COUNT; i++) {
    try {
      const { elapsed, size } = await fetchFull(url);
      times.push(elapsed);
      totalBytes += size;
      console.log(
        `Request ${i}/${REQUEST_COUNT}: ${elapsed.toFixed(3)} s, ${size.toLocaleString("en-US")} bytes`
      );
    } catch (err) {
      console.error(`Request ${i}/${REQUEST_COUNT}: failed — ${err.message}`);
      process.exit(1);
    }
  }

  const totalTime = times.reduce((a, b) => a + b, 0);
  const avgTime = totalTime / REQUEST_COUNT;
  // 1 MB = 1_000_000 bytes; Mbps = (bytes * 8) / (seconds * 1_000_000)
  const totalMb = totalBytes / 1_000_000;
  const speedMbps =
    totalTime > 0 ? (totalBytes * 8) / (totalTime * 1_000_000) : 0;

  console.log();
  console.log(`Average request time: ${avgTime.toFixed(3)} s`);
  console.log(`Total downloaded:     ${totalMb.toFixed(3)} MB`);
  console.log(`Download speed:       ${speedMbps.toFixed(2)} Mbps`);
}

main();
