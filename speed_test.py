#!/usr/bin/env python3
"""Internet download speed test: 10 sequential requests to a given URL."""

from __future__ import annotations

import argparse
import sys
import time
import urllib.error
import urllib.request


REQUEST_COUNT = 10


def fetch(url: str) -> tuple[float, int]:
    """Download the full response. Returns (elapsed_seconds, bytes_downloaded)."""
    start = time.perf_counter()
    with urllib.request.urlopen(url) as response:
        data = response.read()
    elapsed = time.perf_counter() - start
    return elapsed, len(data)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Measure download speed with 10 sequential HTTP requests."
    )
    parser.add_argument(
        "url",
        help="URL to download (e.g. a large image)",
    )
    args = parser.parse_args()
    url = args.url

    times: list[float] = []
    total_bytes = 0

    print(f"URL: {url}")
    print(f"Requests: {REQUEST_COUNT} (sequential)\n")

    for i in range(1, REQUEST_COUNT + 1):
        try:
            elapsed, size = fetch(url)
        except urllib.error.URLError as exc:
            print(f"Request {i}/{REQUEST_COUNT}: failed — {exc}", file=sys.stderr)
            return 1

        times.append(elapsed)
        total_bytes += size
        print(f"Request {i}/{REQUEST_COUNT}: {elapsed:.3f} s, {size:,} bytes")

    total_time = sum(times)
    avg_time = total_time / REQUEST_COUNT
    # 1 MB = 1_000_000 bytes; Mbps = (bytes * 8) / (seconds * 1_000_000)
    total_mb = total_bytes / 1_000_000
    speed_mbps = (total_bytes * 8) / (total_time * 1_000_000) if total_time > 0 else 0.0

    print()
    print(f"Average request time: {avg_time:.3f} s")
    print(f"Total downloaded:     {total_mb:.3f} MB")
    print(f"Download speed:       {speed_mbps:.2f} Mbps")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
