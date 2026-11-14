#!/usr/bin/env node
/**
 * Измерение скорости скачивания: 10 последовательных HTTP-запросов.
 *
 * Пример:
 *   node speed_test.js "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg"
 */

"use strict";

const REQUEST_COUNT = 10; // число последовательных загрузок одного URL
const BYTES_PER_MB = 1_000_000;

/** Скорость в Mbps по суммарному объёму и времени. */
function speedMbps(totalBytes, totalSeconds) {
  if (totalSeconds <= 0) return 0;
  return (totalBytes * 8) / (totalSeconds * BYTES_PER_MB);
}

/** Скачать полный ответ; вернуть { elapsed, size }. */
async function fetchFull(url) {
  const start = performance.now();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const size = (await response.arrayBuffer()).byteLength;
  const elapsed = (performance.now() - start) / 1000;
  return { elapsed, size };
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node speed_test.js <url>");
    process.exit(1);
  }

  let totalTime = 0;
  let totalBytes = 0;

  console.log(`URL: ${url}`);
  console.log(`Requests: ${REQUEST_COUNT} (sequential)\n`);

  for (let i = 1; i <= REQUEST_COUNT; i++) {
    try {
      const { elapsed, size } = await fetchFull(url);
      totalTime += elapsed;
      totalBytes += size;
      console.log(
        `Request ${i}/${REQUEST_COUNT}: ${elapsed.toFixed(3)} s, ${size} bytes`
      );
    } catch (err) {
      console.error(`Request ${i}/${REQUEST_COUNT}: failed — ${err.message}`);
      process.exit(1);
    }
  }

  const avgTime = totalTime / REQUEST_COUNT;
  const totalMb = totalBytes / BYTES_PER_MB;
  const mbps = speedMbps(totalBytes, totalTime);

  console.log();
  console.log(`Average request time: ${avgTime.toFixed(3)} s`);
  console.log(`Total downloaded:     ${totalMb.toFixed(3)} MB`);
  console.log(`Download speed:       ${mbps.toFixed(2)} Mbps`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
