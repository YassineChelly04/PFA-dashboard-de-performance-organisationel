type RegionDensity = {
  region: string;
  count: number;
};

type RegionPin = {
  key: string;
  label: string;
  lat: number;
  lon: number;
};

const TUNISIA_BOUNDS = {
  minLon: 7.45,
  maxLon: 11.95,
  minLat: 30.1,
  maxLat: 37.6,
};

const REGION_PINS: RegionPin[] = [
  { key: "tunis", label: "Tunis", lat: 36.8065, lon: 10.1815 },
  { key: "ariana", label: "Ariana", lat: 36.8665, lon: 10.1647 },
  { key: "benarous", label: "Ben Arous", lat: 36.7538, lon: 10.2189 },
  { key: "manouba", label: "Manouba", lat: 36.8093, lon: 10.0973 },
  { key: "nabeul", label: "Nabeul", lat: 36.4561, lon: 10.7376 },
  { key: "zaghouan", label: "Zaghouan", lat: 36.4029, lon: 10.1413 },
  { key: "bizerte", label: "Bizerte", lat: 37.2746, lon: 9.8739 },
  { key: "beja", label: "Béja", lat: 36.7256, lon: 9.1817 },
  { key: "jendouba", label: "Jendouba", lat: 36.5011, lon: 8.7802 },
  { key: "kef", label: "Le Kef", lat: 36.1742, lon: 8.7049 },
  { key: "siliana", label: "Siliana", lat: 36.0849, lon: 9.3708 },
  { key: "kairouan", label: "Kairouan", lat: 35.6781, lon: 10.0963 },
  { key: "kasserine", label: "Kasserine", lat: 35.1676, lon: 8.8365 },
  { key: "sidibouzid", label: "Sidi Bouzid", lat: 35.0382, lon: 9.4849 },
  { key: "sousse", label: "Sousse", lat: 35.8245, lon: 10.6346 },
  { key: "monastir", label: "Monastir", lat: 35.7643, lon: 10.8113 },
  { key: "mahdia", label: "Mahdia", lat: 35.5047, lon: 11.0622 },
  { key: "sfax", label: "Sfax", lat: 34.7406, lon: 10.7603 },
  { key: "gabes", label: "Gabès", lat: 33.8815, lon: 10.0982 },
  { key: "medenine", label: "Médenine", lat: 33.3549, lon: 10.5055 },
  { key: "tataouine", label: "Tataouine", lat: 32.9297, lon: 10.4518 },
  { key: "tozeur", label: "Tozeur", lat: 33.9197, lon: 8.1335 },
  { key: "kebili", label: "Kébili", lat: 33.7044, lon: 8.969 },
  { key: "gafsa", label: "Gafsa", lat: 34.425, lon: 8.7842 },
];

const REGION_ALIASES: Record<string, string> = {
  tunis: "tunis",
  ariana: "ariana",
  benarous: "benarous",
  "ben arous": "benarous",
  manouba: "manouba",
  nabeul: "nabeul",
  zaghouan: "zaghouan",
  bizerte: "bizerte",
  beja: "beja",
  jendouba: "jendouba",
  kef: "kef",
  "le kef": "kef",
  siliana: "siliana",
  kairouan: "kairouan",
  kasserine: "kasserine",
  sidibouzid: "sidibouzid",
  "sidi bouzid": "sidibouzid",
  sousse: "sousse",
  monastir: "monastir",
  mahdia: "mahdia",
  sfax: "sfax",
  gabes: "gabes",
  medenine: "medenine",
  tataouine: "tataouine",
  tozeur: "tozeur",
  kebili: "kebili",
  gafsa: "gafsa",
};

function normalizeRegionKey(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeLatToMercator(lat: number): number {
  const radians = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

function projectToPercent(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon - TUNISIA_BOUNDS.minLon) / (TUNISIA_BOUNDS.maxLon - TUNISIA_BOUNDS.minLon)) * 100;

  const yTop = normalizeLatToMercator(TUNISIA_BOUNDS.maxLat);
  const yBottom = normalizeLatToMercator(TUNISIA_BOUNDS.minLat);
  const yCurrent = normalizeLatToMercator(lat);
  const y = ((yTop - yCurrent) / (yTop - yBottom)) * 100;

  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}

export function RegionalDensityMap({ regionDensity }: { regionDensity: RegionDensity[] }) {
  const byRegion = new Map<string, number>();

  for (const item of regionDensity) {
    const normalized = normalizeRegionKey(item.region);
    const aliasKey = REGION_ALIASES[normalized] ?? normalized;
    if (!aliasKey) continue;
    byRegion.set(aliasKey, (byRegion.get(aliasKey) ?? 0) + item.count);
  }

  const busiest = [...byRegion.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  const maxValue = busiest?.[1] ?? 0;

  const busiestPin = busiest
    ? REGION_PINS.find((pin) => pin.key === busiest[0])
    : null;

  return (
    <div className="relative h-[260px] overflow-hidden rounded-2xl ring-1 ring-gray-200">
      <iframe
        aria-label="Carte Tunisie"
        className="h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.openstreetmap.org/export/embed.html?bbox=7.45%2C30.1%2C11.95%2C37.6&layer=mapnik"
        title="Carte Tunisie"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-tt-navy/10 to-tt-blue/10" />

      {REGION_PINS.map((pin) => {
        const value = byRegion.get(pin.key) ?? 0;
        if (value <= 0 || maxValue <= 0) return null;

        const ratio = value / maxValue;
        const { x, y } = projectToPercent(pin.lat, pin.lon);
        const size = 8 + Math.round(ratio * 18);
        const opacity = 0.35 + ratio * 0.55;

        return (
          <div
            key={pin.key}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-rose-500/80 shadow-[0_0_0_4px_rgba(244,63,94,0.18)]"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity,
            }}
            title={`${pin.label}: ${value}`}
          />
        );
      })}

      <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 backdrop-blur">
        Densité régionale (volumes incidents)
      </div>

      {busiest && busiestPin ? (
        <div className="pointer-events-none absolute bottom-4 left-4 max-w-[80%] rounded-xl bg-tt-navy/90 px-4 py-3 text-white ring-1 ring-white/20 backdrop-blur">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/75">Hotspot</div>
          <div className="mt-0.5 text-sm font-black">
            {busiestPin.label.toUpperCase()} • {busiest[1]} tickets
          </div>
        </div>
      ) : null}
    </div>
  );
}
