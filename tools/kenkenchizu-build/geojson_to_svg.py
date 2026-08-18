"""
geojson_to_svg.py
==================
Converts a prefecture's real geographic boundary (from the project's
japan_geojson.txt, which is a MultiPolygon FeatureCollection keyed by
JIS prefecture code) into a simplified SVG path string normalized to a
100x100 viewBox, matching the exact method used to build the 12
prefectures already in silhouette-quiz.jsx.

Usage:
    python3 geojson_to_svg.py <geojson_path> <pref_code> [<pref_code> ...]

Example:
    python3 geojson_to_svg.py japan_geojson.txt 13 27 40
    (13=Tokyo, 27=Osaka, 40=Fukuoka)

Output: prints a JS object snippet per prefecture code that can be
pasted directly into the QUESTIONS array in silhouette-quiz.jsx (minus
kana / feature / choices, which must be written by hand -- see
HANDOFF.md).

JIS prefecture codes (1-47), for reference:
 1 北海道   2 青森県   3 岩手県   4 宮城県   5 秋田県   6 山形県   7 福島県
 8 茨城県   9 栃木県  10 群馬県  11 埼玉県  12 千葉県  13 東京都  14 神奈川県
15 新潟県  16 富山県  17 石川県  18 福井県  19 山梨県  20 長野県  21 岐阜県
22 静岡県  23 愛知県  24 三重県  25 滋賀県  26 京都府  27 大阪府  28 兵庫県
29 奈良県  30 和歌山県 31 鳥取県  32 島根県  33 岡山県  34 広島県  35 山口県
36 徳島県  37 香川県  38 愛媛県  39 高知県  40 福岡県  41 佐賀県  42 長崎県
43 熊本県  44 大分県  45 宮崎県  46 鹿児島県 47 沖縄県

Already implemented in silhouette-quiz.jsx (do NOT redo unless refining):
  1 北海道, 12 千葉県, 30 和歌山県, 39 高知県, 46 鹿児島県, 47 沖縄県,
  17 石川県, 23 愛知県, 18 福井県, 2 青森県, 22 静岡県, 26 京都府
"""

import json
import math
import sys


def ring_area(ring):
    a = 0
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2


def rdp(points, epsilon):
    """Douglas-Peucker polyline simplification."""
    if len(points) < 3:
        return points

    def perp_dist(pt, a, b):
        (x, y), (x1, y1), (x2, y2) = pt, a, b
        if (x1, y1) == (x2, y2):
            return math.hypot(x - x1, y - y1)
        num = abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1)
        den = math.hypot(y2 - y1, x2 - x1)
        return num / den

    dmax, idx = 0, 0
    for i in range(1, len(points) - 1):
        d = perp_dist(points[i], points[0], points[-1])
        if d > dmax:
            dmax, idx = d, i
    if dmax > epsilon:
        left = rdp(points[: idx + 1], epsilon)
        right = rdp(points[idx:], epsilon)
        return left[:-1] + right
    return [points[0], points[-1]]


def extract_svg_paths(feature, area_keep_ratio=0.008, max_rings=6, simplify_divisor=130):
    """
    Given one GeoJSON Feature (MultiPolygon), return:
      - list of SVG path 'd' strings (one per kept ring/subpath),
        normalized into a 100x100 viewBox with ~4-unit padding, y-flipped
        so north is up (matches how Claude/SVG coordinates already work
        in silhouette-quiz.jsx).
    Mirrors the exact method used for the 12 existing prefectures:
      1. Take outer ring of every polygon in the MultiPolygon.
      2. Keep the largest ring, plus any ring >= area_keep_ratio of the
         total kept area (keeps notable islands/peninsulas, drops tiny
         islets), capped at max_rings.
      3. Simplify each kept ring with Douglas-Peucker,
         eps = max(bbox_w, bbox_h) / simplify_divisor.
      4. Normalize lon/lat -> 0-100 SVG coords, preserving aspect ratio,
         with north mapped to smaller y (so it renders right-side up
         with no extra CSS flipping needed).
    """
    polys = feature["geometry"]["coordinates"]  # MultiPolygon
    rings_with_area = []
    for poly in polys:
        outer = poly[0]
        rings_with_area.append((ring_area(outer), outer))
    rings_with_area.sort(key=lambda t: -t[0])
    total_area = sum(a for a, _ in rings_with_area)

    kept = []
    for a, ring in rings_with_area:
        if a >= total_area * area_keep_ratio or len(kept) < 1:
            kept.append((a, ring))
        if len(kept) >= max_rings:
            break

    all_pts = [pt for _, ring in kept for pt in ring]
    lons = [p[0] for p in all_pts]
    lats = [p[1] for p in all_pts]
    minlon, maxlon = min(lons), max(lons)
    minlat, maxlat = min(lats), max(lats)
    w, h = maxlon - minlon, maxlat - minlat
    eps = max(w, h) / simplify_divisor

    pad = 4
    size = 100 - pad * 2
    scale = size / max(w, h)
    offx = (100 - w * scale) / 2
    offy = (100 - h * scale) / 2

    paths = []
    for _, ring in kept:
        pts = [(lon, lat) for lon, lat in ring]
        simp = rdp(pts, eps)
        if len(simp) < 4:
            continue
        cmds = []
        for i, (lon, lat) in enumerate(simp):
            x = (lon - minlon) * scale + offx
            y = (1 - (lat - minlat) / h) * (h * scale) + offy  # north -> smaller y
            cmd = "M" if i == 0 else "L"
            cmds.append(f"{cmd}{x:.1f},{y:.1f}")
        cmds.append("Z")
        paths.append("".join(cmds))
    return paths


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    geojson_path = sys.argv[1]
    codes = [int(c) for c in sys.argv[2:]]

    with open(geojson_path, encoding="utf-8") as f:
        data = json.load(f)
    by_id = {feat["properties"]["id"]: feat for feat in data["features"]}

    for code in codes:
        feat = by_id.get(code)
        if not feat:
            print(f"// code {code} not found")
            continue
        name = feat["properties"]["nam_ja"]
        paths = extract_svg_paths(feat)
        print(f"// {code} {name}")
        print("{")
        print(f'  name: "{name}",')
        print('  kana: "TODO_ひらがな読みを入れる",')
        print('  feature: "TODO_この県で出会える生き物などの紹介文",')
        print('  viewBox: "0 0 100 100",')
        print("  paths: [")
        for p in paths:
            print(f'    "{p}",')
        print("  ],")
        print('  choices: ["TODO", "TODO", "TODO", "TODO"], // 4択・正解含む・ひらがな')
        print("},")
        print()


if __name__ == "__main__":
    main()
