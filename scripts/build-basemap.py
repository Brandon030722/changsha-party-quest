#!/usr/bin/env python3
"""Build the Changsha–Zhuzhou self-hosted regional basemap from OSM data.

Run manually when the basemap needs updating; the committed SVG is what Vite
publishes, so the normal Pages build does not need GDAL or a network download.

    python3 scripts/build-basemap.py
    python3 scripts/build-basemap.py --pbf /path/to/hunan-260925.osm.pbf

Requires the GDAL ``ogr2ogr`` command. See BASEMAP-DATA.md for provenance.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import shutil
import subprocess
import tempfile
import urllib.request
from collections import defaultdict
from pathlib import Path


SOURCE_URL = "https://download.geofabrik.de/asia/china/hunan-260925.osm.pbf"
SOURCE_SHA256 = "e0bd73958ade2fe2bc293bfb689e1d0e0fad795a8fdefabbff0ec9fda620ce4e"
BOUNDS = (112.70, 27.65, 113.36, 28.35)  # west, south, east, north
READ_BOUNDS = (112.65, 27.60, 113.41, 28.40)
WIDTH = 1000.0


def mercator_y(lat: float) -> float:
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


WEST, SOUTH, EAST, NORTH = BOUNDS
HEIGHT = WIDTH * (mercator_y(NORTH) - mercator_y(SOUTH)) / math.radians(EAST - WEST)


def project(point: list[float] | tuple[float, float]) -> tuple[float, float]:
    lon, lat = point[:2]
    return (
        (lon - WEST) / (EAST - WEST) * WIDTH,
        (mercator_y(NORTH) - mercator_y(lat)) / (mercator_y(NORTH) - mercator_y(SOUTH)) * HEIGHT,
    )


def num(value: float) -> str:
    # One unit in the SVG is below a display pixel at the initial fit. Whole
    # units keep the map small enough for a mobile first load.
    return str(round(value))


def points_path(points: list[list[float]], close: bool = False) -> str:
    if len(points) < (3 if close else 2):
        return ""
    xy = [project(point) for point in points]
    command = "M" + "L".join(f"{num(x)} {num(y)}" for x, y in xy)
    return command + ("Z" if close else "")


def line_parts(geometry: dict) -> list[list[list[float]]]:
    if geometry["type"] == "LineString":
        return [geometry["coordinates"]]
    if geometry["type"] == "MultiLineString":
        return geometry["coordinates"]
    return []


def polygon_parts(geometry: dict) -> list[list[list[list[float]]]]:
    if geometry["type"] == "Polygon":
        return [geometry["coordinates"]]
    if geometry["type"] == "MultiPolygon":
        return geometry["coordinates"]
    return []


def line_length(points: list[list[float]]) -> float:
    xy = [project(point) for point in points]
    return sum(math.hypot(x2 - x1, y2 - y1) for (x1, y1), (x2, y2) in zip(xy, xy[1:]))


def ring_area(points: list[list[float]]) -> float:
    xy = [project(point) for point in points]
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(xy, xy[1:]))) / 2


def verify_source(path: Path) -> None:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    actual = digest.hexdigest()
    if actual != SOURCE_SHA256:
        raise ValueError(f"Source SHA-256 mismatch: {actual}; expected {SOURCE_SHA256}")


def download_source(path: Path) -> None:
    print(f"Downloading {SOURCE_URL}")
    request = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "ChangshaPartyTripBasemap/1.0"})
    with urllib.request.urlopen(request, timeout=90) as response, path.open("wb") as target:
        shutil.copyfileobj(response, target)


def export_geojson(source: Path, destination: Path, layer: str, where: str, fields: str) -> None:
    # A buffered spatial read keeps road/water vertices just outside the map
    # bounds; the actual geometry is clipped to the exact image overlay bounds.
    command = [
        "ogr2ogr", "-f", "GeoJSON", str(destination), str(source), layer,
        "-spat", *map(str, READ_BOUNDS),
        "-clipsrc", *map(str, BOUNDS),
        "-where", where,
        "-select", fields,
        "-simplify", "0.00018",
        "-lco", "COORDINATE_PRECISION=5",
    ]
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL)


def build_svg(roads: dict, land: dict) -> tuple[str, dict[str, int]]:
    groups: dict[str, list[str]] = defaultdict(list)
    counts: dict[str, int] = defaultdict(int)

    for feature in land["features"]:
        p = feature["properties"]
        natural, landuse, leisure = p.get("natural"), p.get("landuse"), p.get("leisure")
        if natural == "water":
            kind, minimum = "water", 2
        elif leisure in ("park", "garden") or landuse in ("grass", "meadow", "recreation_ground"):
            kind, minimum = "park", 5
        else:
            kind, minimum = "forest", 12
        for polygon in polygon_parts(feature["geometry"]):
            if not polygon or ring_area(polygon[0]) < minimum:
                continue
            rings = "".join(points_path(ring, close=True) for ring in polygon)
            if rings:
                groups[kind].append(f'<path d="{rings}"/>')
                counts[kind] += 1

    for feature in roads["features"]:
        p = feature["properties"]
        highway, railway, waterway = p.get("highway"), p.get("railway"), p.get("waterway")
        if waterway:
            kind, minimum = "waterway", 5
        elif railway:
            kind, minimum = "railway", 5
        elif highway in ("motorway", "trunk"):
            kind, minimum = "expressway", 2
        elif highway in ("primary", "secondary"):
            kind, minimum = "major_road", 3
        elif highway == "tertiary":
            kind, minimum = "local_road", 12
        else:
            kind, minimum = "links", 5
        for line in line_parts(feature["geometry"]):
            if line_length(line) < minimum:
                continue
            path = points_path(line)
            if path:
                groups[kind].append(path)
                counts[kind] += 1

    def paths(kind: str) -> str:
        return "".join(groups[kind])

    def lines(kind: str, attrs: str) -> str:
        return f'<path d="{"".join(groups[kind])}" {attrs}/>' if groups[kind] else ""

    # Paths are drawn by hierarchy. Road casings use SVG <use> to keep the
    # published asset small while retaining crisp edges when users zoom in.
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {num(WIDTH)} {HEIGHT:.6f}" preserveAspectRatio="none" role="img" aria-label="长沙至株洲道路、铁路、水系和绿地底图，地图数据来自 OpenStreetMap">
<defs>
<pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="#ffffff" stroke-width="1" opacity=".38"/></pattern>
<path id="local" d="{''.join(groups['local_road'])}"/>
<path id="major" d="{''.join(groups['major_road'])}"/>
<path id="express" d="{''.join(groups['expressway'])}"/>
<path id="links" d="{''.join(groups['links'])}"/>
<path id="rail" d="{''.join(groups['railway'])}"/>
</defs>
<rect width="1000" height="{HEIGHT:.6f}" fill="#e7f1e9"/>
<g fill="#d6e7d8" stroke="none" fill-rule="evenodd">{paths('forest')}</g>
<g fill="#cce4d1" stroke="none" fill-rule="evenodd">{paths('park')}</g>
<g fill="#badde9" stroke="none" fill-rule="evenodd">{paths('water')}</g>
<path d="{''.join(groups['waterway'])}" fill="none" stroke="#96c7d7" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<rect width="1000" height="{HEIGHT:.6f}" fill="url(#grid)"/>
<use xlink:href="#local" fill="none" stroke="#f9f9ee" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<use xlink:href="#major" fill="none" stroke="#c8d3ce" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<use xlink:href="#major" fill="none" stroke="#fffdf5" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
<use xlink:href="#express" fill="none" stroke="#9eb9bd" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<use xlink:href="#express" fill="none" stroke="#f8d798" stroke-width="3.7" stroke-linecap="round" stroke-linejoin="round"/>
<use xlink:href="#links" fill="none" stroke="#f7e5b5" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
<use xlink:href="#rail" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<use xlink:href="#rail" fill="none" stroke="#587a8a" stroke-width="1.6" stroke-dasharray="9 6" stroke-linecap="round" stroke-linejoin="round"/>
<g font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" text-anchor="middle" paint-order="stroke" stroke="#f7fbf4" stroke-width="5" stroke-linejoin="round" fill="#24405a">
<text x="430" y="267" font-size="27" font-weight="900" letter-spacing="4">长沙</text>
<text x="662" y="1010" font-size="26" font-weight="900" letter-spacing="4">株洲</text>
</g>
<g font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" fill="#60889c" font-size="15" font-weight="700" letter-spacing="2" opacity=".85"><text x="326" y="520" transform="rotate(76 326 520)">湘江</text></g>
</svg>'''
    return svg, counts


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pbf", type=Path, help="Use an existing copy of the pinned Geofabrik PBF")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "src/assets/local-basemap.svg")
    args = parser.parse_args()
    if shutil.which("ogr2ogr") is None:
        raise SystemExit("Install GDAL so the ogr2ogr command is available")
    source = args.pbf or Path(tempfile.gettempdir()) / "changsha-hunan-260925.osm.pbf"
    if not source.exists():
        download_source(source)
    verify_source(source)
    with tempfile.TemporaryDirectory(prefix="changsha-map-build-") as scratch:
        road_file = Path(scratch) / "roads.geojson"
        land_file = Path(scratch) / "land.geojson"
        export_geojson(source, road_file, "lines", "highway IN ('motorway','motorway_link','trunk','trunk_link','primary','primary_link','secondary','secondary_link','tertiary','tertiary_link') OR railway IN ('rail','high_speed') OR waterway IN ('river','stream')", "highway,railway,waterway,name")
        export_geojson(source, land_file, "multipolygons", "natural IN ('water','wood') OR landuse IN ('forest','grass','recreation_ground','meadow') OR leisure IN ('park','garden')", "natural,landuse,leisure,name")
        roads = json.loads(road_file.read_text())
        land = json.loads(land_file.read_text())
    svg, counts = build_svg(roads, land)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(svg, encoding="utf-8")
    print(f"Wrote {args.output} ({args.output.stat().st_size:,} bytes)")
    print(f"Source SHA-256: {SOURCE_SHA256}")
    print("Features:", dict(sorted(counts.items())))


if __name__ == "__main__":
    main()
