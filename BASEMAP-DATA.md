# Local Changsha–Zhuzhou basemap data

The map in `src/assets/local-basemap.svg` is generated from OpenStreetMap data, **not** copied from `tile.openstreetmap.org` or another tile server. It can be served from this project's GitHub Pages origin and remains visible when a third-party map server is unreachable.

## Provenance

- Data provider: [Geofabrik's Hunan OpenStreetMap extract](https://download.geofabrik.de/asia/china/hunan.html).
- Pinned input: [`hunan-260925.osm.pbf`](https://download.geofabrik.de/asia/china/hunan-260925.osm.pbf), 50,506,279 bytes. Geofabrik lists it as published 2026-09-25 and based on OSM data available through 2026-09-25.
- Input SHA-256: `e0bd73958ade2fe2bc293bfb689e1d0e0fad795a8fdefabbff0ec9fda620ce4e`.
- Data license: [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Display the visible attribution `© OpenStreetMap contributors` linked to [openstreetmap.org/copyright](https://www.openstreetmap.org/copyright) on the map and keep this source note with the published project. If distributing a changed data extract separately, check the ODbL share-alike requirements.
- Bounding box (WGS84): west 112.70, south 27.65, east 113.36, north 28.35. The SVG's vertical coordinate uses Web Mercator, exactly matching Leaflet's default `EPSG:3857` image overlay for these bounds.

## Regeneration

Install GDAL with `ogr2ogr`, then run:

```sh
python3 scripts/build-basemap.py
```

The script checks the source hash, extracts roads, railways, rivers, water areas and green space, clips them to the map bounds, simplifies detail, and writes `src/assets/local-basemap.svg`. The raw PBF is downloaded to the system temporary directory and is not committed. To use a predownloaded copy:

```sh
python3 scripts/build-basemap.py --pbf /path/to/hunan-260925.osm.pbf
```

The generated SVG is roughly 743 KB before HTTP compression. It is a **regional context map**, not a street-level navigation map. OSM coverage and the 2026-09-25 snapshot may omit new roads or venue entrances; directions continue to open a navigation service. Coordinates in this source data are WGS84, matching the site's seven pins. No OpenStreetMap raster tiles are bulk downloaded or packaged; [OSMF's tile policy](https://operations.osmfoundation.org/policies/tiles/) forbids that use of its public tile server.
