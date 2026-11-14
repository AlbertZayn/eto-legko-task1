#!/usr/bin/env node
/**
 * Измерение скорости скачивания через последовательные HTTP-запросы.
 *
 * Скрипт принимает URL, выполняет REQUEST_COUNT запросов строго один за другим
 * (следующий стартует только после полного ответа предыдущего), читает тело
 * ответа целиком и печатает:
 *
 * - среднее время одного запроса (секунды, s);
 * - суммарный объём скачанных данных (мегабайты, MB; 1 MB = 1_000_000 байт);
 * - скорость скачивания (мегабиты в секунду, Mbps), считаемую как
 *   (сумма_байт × 8) / (суммарное_время_с × 1_000_000).
 *
 * Пример:
 *   node speed_test.js "https://httpbin.org/bytes/1048576"
 *
 * Требования: Node.js 18+ (встроенный fetch), без внешних зависимостей.
 */

"use strict";

/** @type {number} Число последовательных загрузок одного и того же URL. */
const REQUEST_COUNT = 10;

/**
 * Скачать полный ответ по URL и замерить длительность.
 *
 * @param {string} url Адрес ресурса (например, тяжёлая картинка или бинарный файл).
 * @returns {Promise<{elapsed: number, size: number}>}
 *   `elapsed` — время от начала запроса до полного чтения тела (секунды);
 *   `size` — размер тела ответа в байтах.
 * @throws {Error} При HTTP-ошибке (не 2xx) или сбое сети.
 */
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

/**
 * Точка входа: разобрать аргументы, выполнить замеры и вывести итог.
 * При ошибке любого запроса завершает процесс с кодом 1.
 *
 * @returns {Promise<void>}
 */
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
