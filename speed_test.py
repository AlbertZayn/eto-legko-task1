#!/usr/bin/env python3
"""Измерение скорости скачивания: 10 последовательных HTTP-запросов.

Пример::

    python3 speed_test.py "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg"
"""

from __future__ import annotations

import argparse
import sys
import time
import urllib.error
import urllib.request


REQUEST_COUNT = 10  # число последовательных загрузок одного URL
BYTES_PER_MB = 1_000_000


def speed_mbps(total_bytes: int, total_seconds: float) -> float:
    """Скорость в Mbps по суммарному объёму и времени."""
    if total_seconds <= 0:
        return 0.0
    return (total_bytes * 8) / (total_seconds * BYTES_PER_MB)


def fetch(url: str) -> tuple[float, int]:
    """Скачать полный ответ; вернуть (секунды, байты)."""
    start = time.perf_counter()
    with urllib.request.urlopen(url) as response:
        if not (200 <= response.status < 300):
            raise urllib.error.HTTPError(
                url, response.status, f"HTTP {response.status}", response.headers, None
            )
        data = response.read()
    elapsed = time.perf_counter() - start
    return elapsed, len(data)


def main() -> int:
    """Разбор аргументов, замеры и вывод итога. 0 — успех, 1 — ошибка."""
    parser = argparse.ArgumentParser(
        description=(
            "Измерение скорости скачивания: 10 последовательных HTTP-запросов. "
            "Выводит среднее время (s), объём (MB) и скорость (Mbps)."
        )
    )
    parser.add_argument(
        "url",
        help="URL для скачивания (например, тяжёлая картинка)",
    )
    args = parser.parse_args()
    url = args.url

    total_time = 0.0
    total_bytes = 0

    print(f"URL: {url}")
    print(f"Requests: {REQUEST_COUNT} (sequential)\n")

    for i in range(1, REQUEST_COUNT + 1):
        try:
            elapsed, size = fetch(url)
        except urllib.error.HTTPError as exc:
            print(
                f"Request {i}/{REQUEST_COUNT}: failed — HTTP {exc.code} {exc.reason}",
                file=sys.stderr,
            )
            return 1
        except urllib.error.URLError as exc:
            print(f"Request {i}/{REQUEST_COUNT}: failed — {exc}", file=sys.stderr)
            return 1

        total_time += elapsed
        total_bytes += size
        print(f"Request {i}/{REQUEST_COUNT}: {elapsed:.3f} s, {size} bytes")

    avg_time = total_time / REQUEST_COUNT
    total_mb = total_bytes / BYTES_PER_MB
    mbps = speed_mbps(total_bytes, total_time)

    print()
    print(f"Average request time: {avg_time:.3f} s")
    print(f"Total downloaded:     {total_mb:.3f} MB")
    print(f"Download speed:       {mbps:.2f} Mbps")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
