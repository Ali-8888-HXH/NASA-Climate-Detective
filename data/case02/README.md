# Case 02 static research data

These six files are compact copies of the corresponding UTF-8 research outputs in `09_app_data/`. They are served with the static website, so players do not need a local research folder, account, token, or backend. Case 02 requests these files only when the player opens the case. No raw daily files are included.

| File | Rows/features | Columns used by Case 02 | Units / meaning |
|---|---:|---|---|
| `six_states_boundary.geojson` | 6 polygons | `properties.state`, geometry | FAO GAUL 2024 Level 1, WGS84; study-state map. |
| `climate_vegetation_monthly_2001_2022.csv` | 396 | `state`, `year`, `month`, `tmax_anomaly_c`, `tmax_mean_c`, `tmax_baseline_c`, `climate_valid_days` | Six states × 22 years × Feb/Mar/Apr; temperature in °C. Monthly anomaly baseline is 2001–2021. |
| `environmental_anomalies_2022.csv` | 18 | `state`, `year`, `month`, `tmax_anomaly_c`, `precip_anomaly_mm` | 2022 month anomalies; temperature °C, precipitation mm. `modis_valid` flags coverage and is not used to validate temperature/rainfall. |
| `wheat_yield_2021_22_case_check.csv` | 6 | state, season, `yield_kg_ha`, `yield_change_pct`, `feb_apr_tmax_anomaly_c`, `feb_apr_precip_anomaly_mm`, `environment_calendar_year` | Official wheat yield kg/ha and change from 2020–21; 2021–22 harvest is matched to environmental calendar year 2022. |
| `modis_mapspam2020_wheat_area_weighted_seasonal.csv` | 132 | state, year, period, `ndvi_mean_static_2020_wheat_area_mask`, `evi_mean_static_2020_wheat_area_mask`, `wheat_mask_reference_year` | Seasonal unitless MODIS greenness indices weighted by a static MapSPAM 2020 wheat-area mask. |
| `final_case_findings.json` | JSON object | `numerical_highlights.tmax_feb_apr_anomaly_c`, `numerical_highlights.tmax_march_anomaly_c` | Curated Phase 2 seasonal/monthly temperature findings; preserves the report's area-weighted state anomalies. |

The monthly climate/vegetation table has unique state/year/month rows and complete 2001–2022 coverage for all six states. The anomaly table intentionally retains the low-coverage Bihar February MODIS row; Case 02 uses its temperature and rainfall fields only. The wheat-specific vegetation clue uses the separate seasonal MapSPAM-weighted table.

Sources: NASA POWER `T2M_MAX` and `PRECTOTCORR` (MERRA-2 corrected precipitation); NASA MODIS/Terra `MODIS/061/MOD13A1`; MapSPAM 2020 V2r2 physical wheat area; Government of India, DA&FW, *Agricultural Statistics at a Glance 2023*; FAO GAUL 2024 Level 1 boundaries. POWER `PRECTOTCORR` is not GPM IMERG. NDVI/EVI are greenness measures, not wheat yield. The fixed 2020 wheat mask is not an annual crop map.
