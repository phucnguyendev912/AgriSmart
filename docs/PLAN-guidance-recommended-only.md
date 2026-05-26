# Guidance Recommended Treatments Only

## Request

Reduce Gemini guidance context by sending only treatments that were actually marked as recommended.

## Files to Update

- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AIService.java`
- `agriai_backend/agriai/src/test/java/com/phucnguyen/agriai/service/AIServiceTest.java`

## Implementation Steps

1. Keep the diagnosis API response unchanged so the frontend still receives every treatment candidate.
2. In guidance generation, detect `DISEASE_DETECTED` responses without any `recommended=true` treatment and return a safe local fallback without calling Gemini.
3. In the disease guidance prompt, include only recommended treatments in the `THUOC DE XUAT` section.
4. Add guidance latency/context logs with a stable prefix.
5. Add unit tests for prompt filtering and no-recommend fallback.

## Out of Scope

- No change to treatment ranking.
- No change to drug interaction checking.
- No Gemini context caching in this phase.
