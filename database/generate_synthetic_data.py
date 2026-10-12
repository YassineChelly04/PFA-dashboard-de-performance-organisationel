"""Generate a synthetic intervention dataset for the SPPOI demo.

The original project was built on real operational records. This script
replaces them with fully synthetic data that keeps the same columns,
formats and overall shape (regions, offers, fault types, resolution codes,
durations) so every app and dashboard works the same way, but no row
describes a real customer line or a real intervention.

Usage:
    python database/generate_synthetic_data.py            # 22,000 rows
    python database/generate_synthetic_data.py --rows 5000 --seed 7

Writes database/all-data.xlsx and database/data.xlsx, and copies them to
the data/ folders of the three apps.
"""

import argparse
import random
import shutil
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

SHEET = "hexabyte-02022026"  # sheet name the apps read; kept for compatibility

REGIONS = {
    "TUNIS": 9, "ARIANA": 6, "BENAROUS": 6, "MANNOUBA": 3, "NABEUL": 5, "BIZERTE": 5,
    "BEJA": 5, "JENDOUBA": 2, "KEF": 3, "SILIANA": 1.5, "ZAGHOUAN": 1.5, "SOUSSE": 6,
    "MONASTIR": 5, "MAHDIA": 3, "SFAX": 6, "KAIROUAN": 5, "KASSERINE": 4, "SIDIBOUZID": 4,
    "GAFSA": 7, "TOZEUR": 1, "KEBILI": 1.5, "GABES": 4, "MEDENINE": 4, "TATAOUINE": 1.5,
}
OFFERS = {
    "Offre de Gros ADSL Hybride": 60, "Offre de Gros VDSL Hybride": 20, "Gros ADSL postpayee": 10,
    "Offre de Gros VDSL Postpaye": 5, "SMART ADSL GU TT": 1.5, "FIX-Fixe post paye": 1,
    "ProFixPostpaye Provisoire": 0.8, "Forfait Plafonnee": 0.4, "Prepaye": 0.4, "Post Paye Corporate": 0.3,
}
FAULTS = {
    "Pas de synchronisation": 52, "Déconnexion courante": 22, "Débit lent": 14,
    "Modem synchro et pas d'accès internet": 11, "Débit inversé": 1,
}
RES_CODES = {
    "Aucun": 24, "PC": 22, "IPMSAN": 15, "Distribution": 8, "Installation Interne": 5,
    "Problème FSI": 5, "Câble de branchement": 5, "Modem": 3, "Installation privée": 3,
    "Sous répartiteur": 2, "Câble endommagé Distribution": 2, "Câble endommagé Transport": 2,
    "Alimentation SR": 0.4, "Poste": 0.2, None: 1,
}
ACTIONS_TT = {
    "Rien à signaler": 20, "Fixation Coffret": 15, "Remplacement Jarretière": 11, "Relève Isolement": 8,
    "Remplacement câble": 4, "Client absent": 3, "Configuration Modem": 3, "Modem défectueux": 3,
    "Permutation": 2, "Réparation câble 5/1": 2, "Remplacement Manchon": 2, "Vol": 1.4,
    "Carte électronique": 1.3, "Configuration port": 1, "Travaux": 1, None: 1.2,
}
SPEEDS = {"10 mbps": 36, "20 mbps": 23, "12 mbps": 19, "8 mbps": 13, "4 mbps": 5, "30 mbps": 3, "50 mbps": 0.4}
FSIS = {"Hexabyte": 1}
OBS_TT = ["Ok", "OK", "Nf", "Ret", "Pc", "Isolement", "Jarretière remplacée", "Coffret fixé", None, None]
FSI_ACTIONS = [
    "état modem : Connecté Tonalité : Oui Ligne Suspendue : Non Modem allumé : Oui Synchro sans filtre : Non Message FSI : Connexion établie au moins une fois.",
    "état modem : Connecté Tonalité : Non Ligne Suspendue : Non Modem allumé : Oui Synchro sans filtre : Non Message FSI : Connexion établie au moins une fois. pas de synchronisation, modem et branchement sont vérifiés merci de tester la ligne et de faire le nécessaire.",
    "état modem : Connecté Perte de synchro : Oui Déconnexion sans filtre : Oui Message FSI : Connexion établie au moins une fois.",
    "état modem : Déconnecté Tonalité : Oui Ligne Suspendue : Non Modem allumé : Oui Message FSI : modem redémarré, problème persiste.",
    "Débit mesuré inférieur au débit souscrit, test effectué sans filtre, merci de vérifier la ligne.",
]


def pick(rng, weights: dict, n: int, jitter: float):
    """Sample from a weighted category list, with random jitter on the weights."""
    keys = list(weights)
    w = np.array([weights[k] for k in keys], dtype=float)
    w *= rng.lognormal(0, jitter, len(w))
    w /= w.sum()
    idx = rng.choice(len(keys), size=n, p=w)
    return [keys[i] for i in idx]


def duration_str(td: timedelta) -> str:
    s = int(td.total_seconds())
    d, s = divmod(s, 86400)
    h, s = divmod(s, 3600)
    m, s = divmod(s, 60)
    return f"{d} {h:02d}:{m:02d}:{s:02d}"


def generate(rows: int, seed: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    random.seed(seed)

    n_lines = int(rows * 0.5)
    line_ids = [f"DL-{i:06d}" for i in rng.permutation(np.arange(1, n_lines + 1))]
    # Some lines fail repeatedly: a long-tail draw over line ids.
    line_choice = rng.zipf(1.6, rows) % n_lines
    dlignes = [line_ids[i] for i in line_choice]

    start = datetime(2025, 1, 1)
    # Seasonal shape: a little busier in summer and early autumn.
    day = rng.integers(0, 365, rows)
    season = 1 + 0.12 * np.sin((day - 120) / 365 * 2 * np.pi)
    keep = rng.random(rows) < season / season.max()
    day = np.where(keep, day, rng.integers(0, 365, rows))
    minute = rng.normal(11 * 60, 150, rows).clip(6 * 60, 22 * 60)
    downtime = [start + timedelta(days=int(d), minutes=float(m)) for d, m in zip(day, minute)]

    gap_h = np.where(rng.random(rows) < 0.7, rng.uniform(0, 0.01, rows), rng.lognormal(2.0, 1.2, rows))
    open_t = [d + timedelta(hours=float(g)) for d, g in zip(downtime, gap_h)]

    regions = pick(rng, REGIONS, rows, 0.25)
    # Region effect on resolution time, so the regional delay chart has a story.
    region_factor = {r: float(rng.lognormal(0, 0.35)) for r in REGIONS}
    base = rng.lognormal(3.3, 1.0, rows)
    res_h = np.array([b * region_factor[r] for b, r in zip(base, regions)]).clip(0.05, 2500)

    open_mask = rng.random(rows) < 0.0008
    close_t = [None if o else ot + timedelta(hours=float(h)) for o, ot, h in zip(open_mask, open_t, res_h)]
    tt_dur = [None if (c is None or rng.random() < 0.03) else duration_str(c - ot) for c, ot in zip(close_t, open_t)]

    seq0 = 30_000_000 + int(rng.integers(0, 1_000_000))
    order = np.argsort(open_t)
    hpsm = [""] * rows
    for k, i in enumerate(order):
        hpsm[i] = f"IM{seq0 + k}"
    daily = {}
    refs = []
    for d in downtime:
        key = d.strftime("%y.%m.%d")
        daily[key] = daily.get(key, 0) + 1
        refs.append(f"{key}.{daily[key]:03d}")

    df = pd.DataFrame({
        "DLigne": dlignes,
        "reference_no Extranet": refs,
        "downtime_start (Extranet)": downtime,
        "open_time (HPSM)": open_t,
        "Ref HPSM": hpsm,
        "problem_status": ["Ouvert" if o else "Clôturé" for o in open_mask],
        "close_time": close_t,
        "resolution_code": pick(rng, RES_CODES, rows, 0.2),
        "Region": regions,
        "Offre": pick(rng, OFFERS, rows, 0.2),
        "brief_description": pick(rng, FAULTS, rows, 0.15),
        "DebitADSL": pick(rng, SPEEDS, rows, 0.15),
        "FSIADSL": pick(rng, FSIS, rows, 0),
        "product_type": pick(rng, ACTIONS_TT, rows, 0.2),
        "resolution observation TT": [random.choice(OBS_TT) for _ in range(rows)],
        "TT_resolution_duration": tt_dur,
        "action faite par FSI meme avant d'entrer de saisir un eréclamation sur extranet": [random.choice(FSI_ACTIONS) for _ in range(rows)],
    })
    return df.sort_values("open_time (HPSM)").reset_index(drop=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rows", type=int, default=22000)
    ap.add_argument("--seed", type=int, default=2026)
    args = ap.parse_args()

    root = Path(__file__).resolve().parent.parent
    df = generate(args.rows, args.seed)
    full = root / "database" / "all-data.xlsx"
    small = root / "database" / "data.xlsx"
    with pd.ExcelWriter(full) as w:
        df.to_excel(w, sheet_name=SHEET, index=False)
    with pd.ExcelWriter(small) as w:
        df.head(3).to_excel(w, sheet_name="Feuil1", index=False)

    shutil.copy(full, root / "agent-tt" / "data" / "all-data.xlsx")
    shutil.copy(full, root / "interface-fsi" / "data" / "all-data.xlsx")
    shutil.copy(small, root / "dashboard principale" / "data" / "data.xlsx")
    print(f"Wrote {len(df):,} synthetic rows to {full}")


if __name__ == "__main__":
    main()
