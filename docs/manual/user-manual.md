# Sample Lab App: User Manual

**Manual version:** 0.2.0 (applies to Sample Lab App 0.2.0)

> Versioned with the app and shipped in every release bundle. Bump the version above together with
> `app/package.json` so the bundle's manual version matches the release.

## Glucose conversion

`glucoseMgDlToMmolL(mgdl)` converts mg/dL to mmol/L, rounded to one decimal place. Negative or non-numeric input is rejected; the error message includes the received value.

## Result flagging

`flagResult(value, range)` returns `CRITICAL_LOW`, `LOW`, `NORMAL`, `HIGH` or `CRITICAL_HIGH`.
Critical limits are inclusive.

## Report lines

`formatResult(test, value, unit, flag)` returns e.g. `Glucose: 5.4 mmol/L (NORMAL)`.
