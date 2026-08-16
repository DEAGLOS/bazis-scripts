#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
obj_to_bazis.py — автономный конвертер экспорта .obj (Pro100 и т.п.)
в черновой JS-скрипт построения панелей для Базис-Мебельщика.

Не использует ИИ и не требует интернета — чистый разбор геометрии:
- Каждый объект (`o`/`g` в OBJ) становится отдельной панелью.
- Толщина и ориентация панели (вертикальная/горизонтальная/фасадная)
  определяются автоматически по наименьшему измерению bounding box.
- Материал панели = реальное имя текстуры/декора из .mtl (через
  materialData.SetupActiveMaterial в сгенерированном скрипте).
- Единицы OBJ (метры) переводятся в миллиметры (Base is).

ВАЖНО: это ЧЕРНОВАЯ геометрическая реконструкция для визуальной проверки —
паз, кромка, крепёж не закладываются, только габариты и позиции панелей.
Также этот конвертер не отличает мебель от стен/пола/потолка сцены —
в скрипт попадает вообще всё, что было в OBJ.

Использование:
    python3 obj_to_bazis.py путь/к/файлу.obj [путь/к/выходу.js]

Если путь к .mtl не указан отдельно — берётся из директивы `mtllib` внутри
.obj (тот же файл, что лежит рядом), и если .mtl не найден — материалы
просто не назначаются (панели строятся без материала).

Требования: только стандартная библиотека Python 3, ничего ставить не нужно.
"""

import sys
import os
import re


# ---------- Транслитерация непереводимых в CP1251 символов ----------
# CP1251 не знает польских диакритик — заменяем на близкие латинские буквы,
# чтобы избежать кракозябр в именах материалов/панелей внутри Базиса.
TRANSLIT_MAP = {
    'ł': 'l', 'Ł': 'L', 'ó': 'o', 'Ó': 'O', 'ż': 'z', 'Ż': 'Z',
    'ź': 'z', 'Ź': 'Z', 'ą': 'a', 'Ą': 'A', 'ę': 'e', 'Ę': 'E',
    'ć': 'c', 'Ć': 'C', 'ś': 's', 'Ś': 'S', 'ń': 'n', 'Ń': 'N',
}


def translit(s):
    return ''.join(TRANSLIT_MAP.get(ch, ch) for ch in s)


def js_str(s):
    s = translit(s)
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def clean_mat_name(texpath):
    base = texpath.split('//')[-1].split('/')[-1].split('\\')[-1]
    base = os.path.splitext(base)[0]
    base = base.replace('_', ' ').strip()
    base = re.sub(r'\s+', ' ', base)
    return base


def parse_mtl(mtl_path):
    """Возвращает {имя_материала: путь_к_текстуре}."""
    mtl_map = {}
    if not os.path.exists(mtl_path):
        return mtl_map
    cur = None
    with open(mtl_path, encoding='utf-8', errors='replace') as f:
        for line in f:
            line = line.strip()
            if line.startswith('newmtl'):
                cur = line.split(None, 1)[1]
            elif line.startswith('map_Kd') and cur:
                mtl_map[cur] = line.split(None, 1)[1]
    return mtl_map


def parse_obj(obj_path):
    """Возвращает список объектов: [{'name','mtl','indices'}], и список вершин."""
    with open(obj_path, encoding='utf-8', errors='replace') as f:
        raw_lines = f.read().splitlines()

    all_v = []
    objects = []
    cur_name, cur_mtl, cur_idx = None, None, []
    mtllib_name = None

    for line in raw_lines:
        line = line.rstrip('\r')
        if line.startswith('v '):
            parts = line.split()
            all_v.append((float(parts[1]), float(parts[2]), float(parts[3])))
        elif line.startswith('mtllib'):
            mtllib_name = line.split(None, 1)[1].strip()
        elif line.startswith('o '):
            if cur_name is not None:
                objects.append({'name': cur_name, 'mtl': cur_mtl, 'indices': cur_idx})
            cur_name = line[2:].strip()
            cur_idx = []
        elif line.startswith('usemtl'):
            cur_mtl = line.split(None, 1)[1].strip()
        elif line.startswith('f '):
            for tok in line.split()[1:]:
                vi = int(tok.split('/')[0])
                idx = vi - 1 if vi > 0 else len(all_v) + vi
                cur_idx.append(idx)

    if cur_name is not None:
        objects.append({'name': cur_name, 'mtl': cur_mtl, 'indices': cur_idx})

    return objects, all_v, mtllib_name


def bbox(all_v, indices):
    xs = [all_v[i][0] for i in indices]
    ys = [all_v[i][1] for i in indices]
    zs = [all_v[i][2] for i in indices]
    return (min(xs), min(ys), min(zs)), (max(xs), max(ys), max(zs))


def generate_script(obj_path, out_path=None):
    obj_path = os.path.abspath(obj_path)
    obj_dir = os.path.dirname(obj_path)

    objects, all_v, mtllib_name = parse_obj(obj_path)

    mtl_map = {}
    if mtllib_name:
        mtl_path = os.path.join(obj_dir, mtllib_name)
        mtl_map = parse_mtl(mtl_path)

    lines = []
    lines.append("// Автосгенерировано obj_to_bazis.py — черновая геометрическая")
    lines.append("// реконструкция из '%s'." % os.path.basename(obj_path))
    lines.append("// Паз, кромка, крепёж НЕ заложены — только габариты/позиции панелей.")
    lines.append("")
    lines.append("alert('Скрипт сгенерирован конвертером obj_to_bazis.py\\n\\n'"
                 " + 'Автор: Виталий Ястов\\n'"
                 " + 'Все скрипты: https://boosty.to/vetalyty');")
    lines.append("")
    lines.append("var okCount = 0, failCount = 0;")
    lines.append("var failLog = [];")
    lines.append("")

    built = 0
    for i, obj in enumerate(objects):
        if not obj['indices']:
            continue
        mn, mx = bbox(all_v, obj['indices'])
        dx = (mx[0] - mn[0]) * 1000
        dy = (mx[1] - mn[1]) * 1000
        dz = (mx[2] - mn[2]) * 1000
        dims = [dx, dy, dz]
        thin_axis = dims.index(min(dims))
        thickness = round(dims[thin_axis], 1)

        tex = mtl_map.get(obj['mtl'], '')
        matname = clean_mat_name(tex) if tex else ('mat_' + str(obj['mtl'] or 'none'))

        mnx, mny, mnz = mn[0] * 1000, mn[1] * 1000, mn[2] * 1000
        mxx, mxy, mxz = mx[0] * 1000, mx[1] * 1000, mx[2] * 1000

        lines.append("try {")
        lines.append(
            "  try { materialData.SetupActiveMaterial(%s, %s, 0); } "
            "catch (eMat%d) { try { ActiveMaterial.Make(%s, %s, 0); } "
            "catch (eMat%dB) { /* ни новый, ни старый способ недоступны — строим без материала */ } }"
            % (js_str(matname), thickness, i, js_str(matname), thickness, i)
        )
        if thin_axis == 1:
            lines.append("  var P = AddHorizPanel(%.2f, %.2f, %.2f, %.2f, %.2f);" % (mnx, mnz, mxx, mxz, mny))
        elif thin_axis == 0:
            lines.append("  var P = AddVertPanel(%.2f, %.2f, %.2f, %.2f, %.2f);" % (mnz, mny, mxz, mxy, mnx))
        else:
            lines.append("  var P = AddFrontPanel(%.2f, %.2f, %.2f, %.2f, %.2f);" % (mnx, mny, mxx, mxy, mnz))
        lines.append("  P.Name = %s;" % js_str(obj['name']))
        lines.append("  P.Build();")
        lines.append("  okCount++;")
        lines.append("} catch (e%d) {" % i)
        lines.append("  failCount++;")
        lines.append("  failLog.push(%s + ': ' + e%d.message);" % (js_str(obj['name']), i))
        lines.append("}")
        lines.append("")
        built += 1

    lines.append(
        "alert('Построено: ' + okCount + ' из ' + (okCount+failCount) + "
        "'\\n\\n' + (failLog.length ? 'Ошибки:\\n' + failLog.join('\\n') : 'Ошибок нет.'));"
    )

    script_text = "\n".join(lines)

    if out_path is None:
        out_path = os.path.splitext(obj_path)[0] + '_bazis.js'

    # Пишем сразу в CP1251 (как требует Базис), не UTF-8.
    with open(out_path, 'w', encoding='cp1251', errors='replace') as f:
        f.write(script_text)

    return out_path, built, len(objects)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Использование: python3 obj_to_bazis.py файл.obj [выход.js]")
        sys.exit(1)

    obj_arg = sys.argv[1]
    out_arg = sys.argv[2] if len(sys.argv) > 2 else None

    out_path, built, total = generate_script(obj_arg, out_arg)
    print("Готово: %s" % out_path)
    print("Панелей построено в скрипте: %d из %d объектов OBJ" % (built, total))
