# Gilla ARM64 Recovery — START HERE (new session handoff)

Read this first. Everything below is confirmed; do not re-derive or repeat failed experiments.

## Environment / tools (all already present on this Windows machine)
- Repo: `C:\Users\devon\Downloads\gilla-arm-ci`, remote `helloiamkevinboy/gilla-arm-ci`, branch **`arm64-dump-fix`**.
- `gh` is authenticated as `helloiamkevinboy` (scopes repo+workflow). Repo is public.
- Dispatch a run:
  `gh workflow run dump.yml --ref arm64-dump-fix -f apk_url="https://drive.google.com/file/d/1HPNRDVhQmeQH0g_r6d1QkDU06RiatfI3/view?usp=drive_link" -f android="14.0.0-latest"`
  then watch: `gh run watch <id> --exit-status --interval 30` (runs ~8–12 min).
- Download artifacts: `gh run download <id> -D <dir>` → `gilla_dump.cs`, `dump_driver.log`, `logcat.txt`.
- Python: `C:\Users\devon\AppData\Local\Programs\Python\Python312\python.exe` (has capstone, pyelftools, frida, pyyaml). node available for `--check`.
- `libil2cpp.so` for static work: `C:\Users\devon\Downloads\ByeGilla\decompiled\lib\arm64-v8a\libil2cpp.so`.
- Output root: `C:\Users\devon\Downloads\Gilla-Recovered-Scripts\ARM64-Recovery\` (Classes/ Methods/ Fields/ Raw/ Validation/ Logs/ Reports/ Source/ Decompiled/ Metadata/).
- Post-processor ready: `postproc.py` (in Reports/ — copy from scratchpad if missing); usage:
  `python postproc.py <gilla_dump.cs> C:\Users\devon\Downloads\Gilla-Recovered-Scripts\ARM64-Recovery`
  It parses the `===C|ns|name|parent` / `F:` / `M:name|rva` format into per-class .cs + classes.json.

## The pipeline WORKS (don't rebuild it)
redroid (native arm64) boots, arm64 game installs, Frida attaches, IL2CPP inits. Unity **6000.5.2f1**,
IL2CPP metadata v31, 189 obfuscated exports (non-contiguous subset of 234). Anti-tamper `GillaIntegrity`
fires after init but doesn't block dumping. `dump.yml` launch step uses `UnityPlayerGameActivity`.

## CONFIRMED facts (disassembly + runtime verified)
- `il2cpp_get_corlib` = SORTED index 11 (returns mscorlib `Il2CppImage*`).
- `Il2CppClass.name` @ **0x10**, `Il2CppClass.namespaze` @ **0x18**  (getters idx35/idx36).
- `MethodInfo.name` @ **0x10**, `MethodInfo.methodPointer` @ **0x0** (RVA = methodPointer − module.base).
- Class member **pointer-arrays** (8-byte elems) at offsets **0x80 (count 0x124)**, **0x88 (count 0x120)**,
  **0x90 (count 0x12c)** — these are methods/properties/events/nested/interfaces (from the
  class_get_* iterator disassembly). ONE of them is `methods` (MethodInfo**).
- The full verified export map + per-export fingerprints: `Metadata/verified_export_map.md`,
  `Metadata/static_export_fingerprints.txt`; disassembler `Source/fingerprint_exports.py`.

## What is RECOVERED (done, real)
`Decompiled/recovered_class_names.cs` — 306 high-confidence class names incl. game classes
(GillaDoor, GillaStash, GillaOre, GillaOreField, GillaRecycler, GillaFuse, GillaItem, GillaBackpack,
GillaCorpse, GillaWounds, GillaSplashGame/Monster/Pool, GillaModeRound, GillaOfflineReport, GillaLivDock…).
Raw noisy dumps in `Logs/run*_raw_dump*.cs`.

## What is NOT recovered yet: per-class METHODS & FIELDS
The structural class scan works (name@0x10), but cleanly isolating real `TypeDefinition` classes
(vs MethodInfo structs, array/generic instances, and string-fragment false positives) and reading
their method/field arrays has not landed. Agents calib1–14 are in `Source/` (each commit msg explains
what it tried and why it failed). Key dead ends — DO NOT repeat:
- `class_for_each`/`image_get_class` are NOT usable in the 189-export subset.
- Globals 0x68efb20 (empty transient vector) and 0x68efb70 (metadata pool descriptor) are NOT class tables.
- No reliable self-ref in Il2CppClass at offsets 0x20–0x78.
- image==corlib anchors are array/generic instances (Entry[], KeyValuePair`2[]) with NO methods array.
- calib14 scored 0/1500 because it sampled the FIRST 1500 candidates (mostly non-class) and required
  MethodInfo.klass at a guessed offset.

## THE NEXT FIX (calib15) — concrete plan
Base on `Source/calib14_agent.js`. Change the methods calibration to be population-wide and
assumption-free:
1. Build candidates as now (name@0x10 readable, ns@0x18 readable/"", [0x0] pointer-ish). ~53k.
2. Sample **randomly across ALL candidates** (e.g., every Nth, 2000 samples), not the first 1500.
3. For each candidate C and each array offset AO in {0x80,0x88,0x90} with its count CO: read arr=[C+AO],
   cnt=[C+CO] (1..5000). First find offsets where arr[0..4] entries have a **readable method-like name
   at +0x10** (.ctor/.cctor/get_/set_/add_/remove_/op_ or identifier). That identifies the methods array
   WITHOUT needing klass.
4. THEN derive `MethodInfo.klass` offset empirically: for those validated method entries, find the offset
   (scan 0x00..0x40) where `*(method+ko) == C`. That gives klass offset for free.
5. Real classes = candidates whose methods array has entries with method-like names AND (once known)
   klass-backref holds. This both filters and calibrates. Log counts + why candidates fail.
6. Derive parent (offset in 0x30..0x78 pointing to another real class for most), fields
   (FieldInfo struct array elem 0x20, name@0x0, parent@0x10==C).
7. Validate: find GameObject/Transform/MonoBehaviour among real classes; confirm methods include
   plausible names. Then dump `===C|ns|name|parent` + `F:`/`M:name|rva`, run postproc.py.

If methods land: investigate native bodies via RVAs in libil2cpp.so/libgame.so (Ghidra/capstone) as the
stretch goal. Do NOT fabricate bodies.

## Current status line
14 runs done. Class-name inventory recovered. Method/field layout is the open problem; calib15 plan above
is the concrete next step. Last run: calib14 (45589599379) — methods score 0/1500 (sampling bug + klass offset).
