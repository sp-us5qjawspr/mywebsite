#!/usr/bin/env python3
"""Fetch public WSPR reports for a noncommercial personal dashboard."""
import json, os, urllib.parse, urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

CALL = 'SP/US5QJA'
BANDS = (1, 3, 5, 7, 10, 14, 18, 21, 24, 28, 50, 70, 144)  # band codes in MHz
BASE = 'https://db1.wspr.live/'
OUT = Path(__file__).parent / 'data' / 'spots.json'

def fetch(hours):
    # Bounded time and band query; limit to prevent overloading volunteer infrastructure.
    sql = ("SELECT band, time, rx_sign, rx_loc, rx_lat, rx_lon, tx_loc, tx_lat, tx_lon, "
           "distance, snr, frequency, power FROM wspr.rx "
           f"WHERE band IN {BANDS} AND tx_sign = '{CALL}' "
           f"AND time >= now() - INTERVAL {hours} HOUR "
           "ORDER BY time DESC LIMIT 30000 FORMAT JSON")
    url = BASE + '?query=' + urllib.parse.quote(sql)
    req = urllib.request.Request(url, headers={'User-Agent':'SP-US5QJA-WSPR-Monitor/1.0 (personal noncommercial project)'})
    with urllib.request.urlopen(req, timeout=40) as resp:
        obj = json.load(resp)
    return obj['data']

def main():
    now = datetime.now(timezone.utc).isoformat(timespec='seconds')
    results = {}
    for hours in (24,168,720):
        try:
            results[str(hours)] = fetch(hours)
            print(f'{hours}h: {len(results[str(hours)])} spots')
        except Exception as exc:
            print(f'Failed fetching {hours}h: {exc}')
            # Preserve previous data for failed windows, but clearly flag staleness.
            if OUT.exists():
                previous = json.loads(OUT.read_text(encoding='utf-8'))
                results[str(hours)] = previous.get('windows', {}).get(str(hours), [])
            else:
                results[str(hours)] = []
            results.setdefault('errors', {})[str(hours)] = str(exc)
    if all(not results.get(str(h)) for h in (24,168,720)):
        raise RuntimeError('No usable WSPR data; refusing to publish empty dashboard')
    payload = {'callsign':CALL,'bands_mhz':list(BANDS),'updated_utc':now,
               'windows':{str(h):results[str(h)] for h in (24,168,720)},
               'errors':results.get('errors',{})}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(',',':')), encoding='utf-8')

if __name__ == '__main__': main()
