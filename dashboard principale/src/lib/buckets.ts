import type { IncidentRow } from "./model";
import { normalizeText } from "./text";

export type OfferCluster = "ADSL" | "VDSL" | "FIBRE" | "AUTRES / DATA";

export function clusterOffer(offer: string | null): OfferCluster | null {
  const o = (offer ?? "").toUpperCase();
  if (!o) return null;
  if (o.includes("FIBRE") || o.includes("FTTH")) return "FIBRE";
  if (o.includes("VDSL")) return "VDSL";
  if (o.includes("ADSL")) return "ADSL";
  return "AUTRES / DATA";
}

export type ServiceBucket = "Technique Réseau" | "Technique Local" | "Service / Client";

export function serviceBucket(productType: string | null): ServiceBucket {
  const p = normalizeText(productType)?.toLowerCase() ?? "";

  const network =
    p.includes("coffret") ||
    p.includes("câble") ||
    p.includes("cable") ||
    p.includes("distribution") ||
    p.includes("transport") ||
    p.includes("splitter") ||
    p.includes("dslam") ||
    p.includes("raduis") ||
    p.includes("compte") ||
    p.includes("répartiteur") ||
    p.includes("repartiteur");

  const local =
    p.includes("jarretière") ||
    p.includes("jarretiere") ||
    p.includes("isolement") ||
    p.includes("manchon") ||
    p.includes("installation priv") ||
    p.includes("permutation");

  const client =
    p.includes("client") ||
    p.includes("absent") ||
    p.includes("configuration modem") ||
    p.includes("modem") ||
    p.includes("signal") ||
    p.includes("rien");

  // precedence: network issues first, then local physical work, otherwise client/service
  if (network) return "Technique Réseau";
  if (local) return "Technique Local";
  if (client) return "Service / Client";

  // default split: treat unknowns as local ops noise
  return "Technique Local";
}

export function offerClusterCounts(rows: IncidentRow[]): {
  cluster: OfferCluster;
  count: number;
  breakdown: Record<ServiceBucket, number>;
}[] {
  const map = new Map<OfferCluster, { count: number; breakdown: Record<ServiceBucket, number> }>();

  for (const row of rows) {
    const c = clusterOffer(row.offer);
    if (!c) continue;

    const bucket = serviceBucket(row.productType);
    const entry =
      map.get(c) ??
      ({
        count: 0,
        breakdown: {
          "Technique Réseau": 0,
          "Technique Local": 0,
          "Service / Client": 0,
        },
      } satisfies { count: number; breakdown: Record<ServiceBucket, number> });

    entry.count += 1;
    entry.breakdown[bucket] += 1;
    map.set(c, entry);
  }

  const order: OfferCluster[] = ["ADSL", "VDSL", "FIBRE", "AUTRES / DATA"];
  return order
    .map((cluster) => {
      const v = map.get(cluster);
      if (!v) return { cluster, count: 0, breakdown: { "Technique Réseau": 0, "Technique Local": 0, "Service / Client": 0 } };
      return { cluster, count: v.count, breakdown: v.breakdown };
    })
    .filter((x) => x.count > 0);
}
