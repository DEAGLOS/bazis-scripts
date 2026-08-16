#!/usr/bin/env python3
"""
Конвертер JSON-дампа модели Базиса (Экспорт_JSON_3D.js) в .gltf.

Каждый элемент дампа содержит 8 угловых точек (Corners) детали в мировых
координатах движка Базиса (X=ширина, Y=высота, Z=глубина, мм) — то есть
уже Y-up, как и glTF, поэтому оси не переворачиваем, только масштабируем
мм -> м.

Геометрия каждой детали строится через выпуклую оболочку (ConvexHull) её
8 угловых точек — работает независимо от того, повёрнута деталь в
пространстве или нет, без нужды вручную считать грани коробки.

Детали с нулевым объёмом (служебные линии/маркеры — Size содержит 0)
пропускаются: это не геометрия, а вспомогательные объекты Базиса.
"""
import json
import struct
import base64
import sys
from scipy.spatial import ConvexHull
import numpy as np

MM_TO_M = 0.001

# служебные объекты Базиса, которые не являются реальными деталями изделия —
# пропускаем по точному совпадению имени (регистр не важен)
IGNORE_NAMES = {
    "габаритная рамка",
}

def decode_color(c):
    """Delphi TColor int -> (r,g,b) 0..1 float. Байты: R=младший, G=средний, B=старший."""
    if c is None:
        return (0.75, 0.75, 0.75)  # серый по умолчанию — крепёж/фурнитура без материала
    r = (c & 0xFF) / 255.0
    g = ((c >> 8) & 0xFF) / 255.0
    b = ((c >> 16) & 0xFF) / 255.0
    return (r, g, b)

def build_gltf(elements, out_path):
    positions = []   # flat float32 vertex list (across all meshes, per-primitive offsets tracked)
    all_prims = []
    materials = []
    material_index = {}  # color tuple -> material index

    skipped_degenerate = 0
    skipped_error = 0
    skipped_ignored = 0

    for el in elements:
        name = (el.get("Name") or "").strip()
        if name.lower() in IGNORE_NAMES:
            skipped_ignored += 1
            continue

        corners = el.get("Corners")
        size = el.get("Size")
        if not corners or el.get("CornersError"):
            skipped_error += 1
            continue
        if not size or min(size) < 0.5:  # мм; меньше 0.5мм по любой оси = служебная линия/точка
            skipped_degenerate += 1
            continue

        pts = np.array(corners, dtype=np.float64) * MM_TO_M
        try:
            hull = ConvexHull(pts)
        except Exception:
            skipped_error += 1
            continue

        verts = pts[hull.vertices]  # только точки, входящие в оболочку
        # переиндексация треугольников под сжатый список verts
        remap = {old: new for new, old in enumerate(hull.vertices)}
        tris = np.array([[remap[i] for i in simplex] for simplex in hull.simplices], dtype=np.uint32)

        # развернуть грани наружу: ConvexHull не гарантирует единое
        # направление обхода (winding) относительно нормали, из-за чего
        # часть граней "смотрит" внутрь и пропадает при back-face culling
        centroid = verts.mean(axis=0)
        for i in range(len(tris)):
            a, b, c = verts[tris[i]]
            face_normal = np.cross(b - a, c - a)
            face_centroid = (a + b + c) / 3.0
            if np.dot(face_normal, face_centroid - centroid) < 0:
                tris[i][1], tris[i][2] = tris[i][2], tris[i][1]  # флип winding

        color = el.get("Color")
        rgb = decode_color(color)
        key = rgb
        if key not in material_index:
            material_index[key] = len(materials)
            materials.append(rgb)
        mat_idx = material_index[key]

        all_prims.append((verts.astype(np.float32), tris, mat_idx, el.get("Name", "")))

    # ---- собрать единый бинарный буфер: подряд все позиции, потом все индексы ----
    buffer_bytes = bytearray()
    accessors = []
    buffer_views = []
    meshes = []
    nodes = []
    mesh_indices_for_scene = []

    for verts, tris, mat_idx, name in all_prims:
        # позиции
        pos_offset = len(buffer_bytes)
        buffer_bytes += verts.tobytes()
        while len(buffer_bytes) % 4 != 0:
            buffer_bytes += b'\x00'
        pos_bv = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": pos_offset, "byteLength": verts.nbytes, "target": 34962})
        mins = verts.min(axis=0).tolist()
        maxs = verts.max(axis=0).tolist()
        pos_acc = len(accessors)
        accessors.append({
            "bufferView": pos_bv, "componentType": 5126, "count": len(verts),
            "type": "VEC3", "min": mins, "max": maxs
        })

        # индексы
        idx_offset = len(buffer_bytes)
        buffer_bytes += tris.tobytes()
        while len(buffer_bytes) % 4 != 0:
            buffer_bytes += b'\x00'
        idx_bv = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": idx_offset, "byteLength": tris.nbytes, "target": 34963})
        idx_acc = len(accessors)
        accessors.append({
            "bufferView": idx_bv, "componentType": 5125, "count": int(tris.size), "type": "SCALAR"
        })

        mesh_idx = len(meshes)
        meshes.append({
            "name": name,
            "primitives": [{
                "attributes": {"POSITION": pos_acc},
                "indices": idx_acc,
                "material": mat_idx
            }]
        })
        node_idx = len(nodes)
        nodes.append({"mesh": mesh_idx, "name": name})
        mesh_indices_for_scene.append(node_idx)

    gltf_materials = []
    for rgb in materials:
        gltf_materials.append({
            "doubleSided": True,
            "pbrMetallicRoughness": {
                "baseColorFactor": [rgb[0], rgb[1], rgb[2], 1.0],
                "metallicFactor": 0.0,
                "roughnessFactor": 0.8
            }
        })

    b64 = base64.b64encode(bytes(buffer_bytes)).decode("ascii")

    gltf = {
        "asset": {"version": "2.0", "generator": "bazis-json-to-gltf"},
        "scene": 0,
        "scenes": [{"nodes": mesh_indices_for_scene}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": gltf_materials,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(buffer_bytes), "uri": "data:application/octet-stream;base64," + b64}]
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(gltf, f)

    print(f"Деталей в файле: {len(elements)}")
    print(f"Собрано mesh-примитивов: {len(all_prims)}")
    print(f"Пропущено (служебный габарит проекта): {skipped_ignored}")
    print(f"Пропущено (служебные линии/маркеры, нулевой объём): {skipped_degenerate}")
    print(f"Пропущено (ошибка данных): {skipped_error}")
    print(f"Материалов (уникальных цветов): {len(materials)}")
    print(f"Итоговый .gltf: {out_path} ({len(buffer_bytes)/1024:.1f} КБ буфер)")


if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "test_shkaf.json"
    out = sys.argv[2] if len(sys.argv) > 2 else "model.gltf"
    raw = open(src, "rb").read()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("cp1251")  # Базис часто пишет файлы скриптов в CP1251
    data = json.loads(text)
    build_gltf(data["Elements"], out)
