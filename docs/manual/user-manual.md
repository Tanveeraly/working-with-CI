# Sample Lab App: User Manual

**Manual version:** 0.3.0 (applies to Sample Lab App 0.3.0)

> Versioned with the app and shipped in every release bundle. Bump the version above together with
> `app/package.json` so the bundle's manual version matches the release.

## Glucose conversion

`glucoseMgDlToMmolL(mgdl)` converts mg/dL to mmol/L, rounded to one decimal place. Negative or non-numeric input is rejected; the error message includes the received value.

## HbA1c conversion

`hba1cPercentToMmolMol(percent)` converts HbA1c from NGSP % to IFCC mmol/mol using
`(% - 2.15) x 10.929`, rounded to a whole number (e.g. 6.5 % -> 48 mmol/mol).
Values outside 3-20 % are rejected.

## Result flagging

`flagResult(value, range)` returns `CRITICAL_LOW`, `LOW`, `NORMAL`, `HIGH` or `CRITICAL_HIGH`.
Critical limits are inclusive.

## Report lines

`formatResult(test, value, unit, flag)` returns e.g. `Glucose: 5.4 mmol/L (NORMAL)`.
