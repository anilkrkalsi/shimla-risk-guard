/**
 * SHIMLA RISK GUARD — Rule Engine v1.2
 * FROZEN. Do not modify without legal review and source verification.
 *
 * Returns: { verdict: 'prohibited' | 'highrisk' | 'scope', reasons: string[] }
 *
 * Outputs:
 *   prohibited → 🔴 hard stop
 *   highrisk   → 🟠 proceed with extreme caution
 *   scope      → ⚫ outside tool scope / manual review required
 *
 * Primary source:
 *   Interim Development Plan (IDP) Shimla 2015
 *   Notification dated 13-08-2015
 *   Town & Country Planning Department, Govt. of Himachal Pradesh
 *   HP Gazette, Page 2989+
 *
 * Secondary source:
 *   Shimla Planning Area Development Plan 2041 (notified June 2023)
 *
 * Changelog v1.1 → v1.2
 * ─────────────────────────────────────────────────────────────────────
 * UPDATED : FAR section — gazette reviewed (IDP Shimla 2015, page 2989).
 *           FAR is NOT a single universal number. It varies by:
 *             - Land use category (residential / tourism / commercial /
 *               shopping complex / row houses)
 *             - Plot size band
 *           Table shows: Row Houses/Shops → FAR 2.00; commercial up to ~3.00.
 *           The previously assumed values (Core ≤1.5, Non-Core ≤1.75) are
 *           NOT present in the IDP 2015 gazette. Source unknown — likely
 *           informal DP-2041 draft discussion, not notified regulation.
 *           FAR rule PERMANENTLY disabled until use-category input is added
 *           and clause-specific thresholds are confirmed per category.
 *           FAR inputs retained for manual logging only.
 *
 * NOT CHANGED : All other rules unchanged from v1.1.
 * NOT CHANGED : Parking, room height — out of scope.
 * ─────────────────────────────────────────────────────────────────────
 */

function evaluateRules(p) {
  const reasons = [];
  let verdict = null;

  // ── HARD STOPS (🔴 PROHIBITED) ──────────────────────────────────────

  // Reason format: { finding: string, source: string }
  // Structured objects — never use string delimiters for two-field data.

  // Rule 1: Core area — 2 storeys + attic combination
  if (p.zone === 'core' && p.floors >= 2 && p.attic > 0) {
    reasons.push({ finding: 'Core area: 2-storey + attic combination is prohibited under height restrictions.', source: 'IDP Shimla 2015 — Core Area height regulations · HP Gazette p.2989' });
    verdict = 'prohibited';
  }

  // Rule 2: Core area — floor count exceeds limit
  if (p.zone === 'core' && p.floors > 2) {
    reasons.push({ finding: 'Core area: Exceeds maximum permissible floor count (>2 floors).', source: 'IDP Shimla 2015 — Core Area zoning table · HP Gazette p.2989' });
    verdict = 'prohibited';
  }

  // Rule 3: Slope ≥ 45° — hard prohibition
  // Source: Shimla Planning Area 2041 general regulations
  if (p.slope >= 45) {
    reasons.push({ finding: `Slope of ${p.slope}° meets or exceeds 45° absolute limit. Construction prohibited on this gradient.`, source: 'Shimla Planning Area DP-2041 — slope / gradient restrictions' });
    verdict = 'prohibited';
  }

  // Rule 4: Attic height ≥ 3.5m — classified as full floor
  if (p.attic >= 3.5) {
    reasons.push({ finding: `Attic height of ${p.attic}m meets or exceeds 3.5m threshold. Classified as a full floor under regulations.`, source: 'IDP Shimla 2015 — attic/height definition clause · HP Gazette p.2989' });
    verdict = 'prohibited';
  }

  // Rule 5: Green / Forest zone — any construction prohibited
  if (p.greenzone === 'yes') {
    reasons.push({ finding: 'Proposal site is in Green/Forest zone. Any construction is prohibited.', source: 'IDP Shimla 2015 — Green Zone restrictions · HP Gazette p.2989' });
    verdict = 'prohibited';
  }

  // Rule 6: Hill cut height > 3.5m — hard stop
  // Source: Shimla Planning Area 2041 — max permissible hill cut = 3.50m
  if (p.hillcut > 3.5) {
    reasons.push({ finding: `Hill cut height of ${p.hillcut}m exceeds the 3.5m maximum permissible limit.`, source: 'Shimla Planning Area DP-2041 — hill cut regulations' });
    verdict = 'prohibited';
  }

  // ── HIGH RISK (🟠) ───────────────────────────────────────────────────

  // Rule 7: Road width < 3.0m — access / fire safety risk
  if (p.road < 3.0 && verdict === null) {
    reasons.push({ finding: `Road width of ${p.road}m is below the 3.0m minimum. High risk of rejection on access and fire safety grounds.`, source: 'IDP Shimla 2015 — road width / access requirements · HP Gazette p.2989' });
    verdict = 'highrisk';
  }

  // Rule 8: Slope 36°–<45° — high risk, conservative floor retained
  if (p.slope >= 36 && p.slope < 45 && verdict === null) {
    reasons.push({ finding: `Slope of ${p.slope}° falls in high-risk zone (36°–<45°). Structural engineer certification mandatory.`, source: 'Shimla Planning Area DP-2041 — slope / gradient restrictions' });
    verdict = 'highrisk';
  }

  // NOTE: 30°–<36° warning band removed.
  // No verified clause or formal engineering standard found to support this
  // as a distinct regulatory threshold. Invented caution = invention.
  // If a documented source is found (DP-2041 or HP engineering standard),
  // reinstate here with clause reference.

  // Rule 10: Attic height borderline (3.0m–<3.5m)
  if (p.attic >= 3.0 && p.attic < 3.5 && verdict === null) {
    reasons.push({ finding: `Attic height of ${p.attic}m is approaching the 3.5m prohibited threshold. High risk of reclassification as a full floor.`, source: 'IDP Shimla 2015 — attic/height definition clause · HP Gazette p.2989' });
    verdict = 'highrisk';
  }

  // NOTE: No intermediate hill cut warning band.
  // A 2.5–3.5m high-risk tier was considered but removed — no documented
  // clause supports that threshold. Only the verified 3.5m hard limit stands.
  // If a retaining wall setback clause is found in DP-2041, add it here with source.

  // ── FAR INPUTS COLLECTED — RULE PERMANENTLY DISABLED ────────────────
  // Gazette reviewed: IDP Shimla 2015, HP Gazette page 2989.
  // FAR is NOT a single universal threshold. It varies by land use category
  // (residential, tourism, commercial, shopping complex, row houses) AND
  // by plot size band. Example from table: Row Houses/Shops → FAR 2.00;
  // commercial structures up to ~3.00 depending on category.
  //
  // Previously assumed Core ≤1.5, Non-Core ≤1.75 are NOT present in the
  // gazette. Those figures appear to originate from informal DP-2041 draft
  // discussions, not notified regulation. Do not reinstate without locating
  // the exact notified clause.
  //
  // FAR rule can only be activated if:
  //   (a) building use category input is added to the form
  //   (b) the exact FAR per category per zone is confirmed from a notified gazette
  //   (c) plot-size banding (if any) is confirmed
  // Until then: FAR inputs are logged only. No rule fires.
  //
  // Commented-out block retained for reference:
  // if (p.plot_area > 0) {
  //   const far = p.built_up_area / p.plot_area;
  //   if (p.zone === 'core' && far > X)    { reasons.push(...); verdict = 'prohibited'; }
  //   if (p.zone === 'noncore' && far > Y) { reasons.push(...); verdict = 'prohibited'; }
  // }

  // ── OUTSIDE SCOPE (⚫) ───────────────────────────────────────────────

  if (verdict === null) {
    verdict = 'scope';
    reasons.push({ finding: 'No hard-stop or high-risk rule triggered within this tool\'s v1.2 ruleset.', source: '' });
    reasons.push({ finding: 'This is NOT a compliance signal. Parameters may fall under regulations not covered by this engine.', source: '' });
    reasons.push({ finding: 'Consult IDP Shimla 2015, Shimla Planning Area DP-2041, and applicable gazette notifications directly before proceeding.', source: '' });
  }

  return { verdict, reasons };
}
