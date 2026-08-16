// ============================================================
// Выемка (CutType=2) по форме и месту маркера
//
// Маркер может быть ДВУХ типов:
// 1) Панель произвольной формы (многоугольник) — толщина панели
//    становится базовой глубиной выемки.
// 2) Уже поставленная параметрическая фурнитура/отверстие — берётся её
//    первое отверстие: диаметр, глубина, положение, тип сверления читаются
//    напрямую из Fastener.Holes.
//
// ДВЕ КНОПКИ: "Выбрать панель и маркер" — выбирает пару И СРАЗУ строит
// выемку (видно результат сразу после выбора, можно нажимать много раз —
// каждый раз новая пара, новая выемка); "Готово" — просто нормально
// завершает скрипт (без Escape, без отката уже сделанного).
//
// Источник механики: форум Базиса — Cut.CutType=2, Cut.Thickness,
// Cut.Contour — реальная форма выемки (Trajectory не используется вообще).
// Fastener.Holes — подтверждено практикой на реальной фурнитуре.
// ============================================================

function SelectObjects() {
    try {
        HostPanel = interaction.getRequest.GetObject('Укажите панель, в которой делать выемку');
        Marker = interaction.getRequest.GetObject('Укажите маркер: панель ИЛИ поставленное параметрическое отверстие/фурнитуру');
    } catch (eNewSel) {
        // старая версия Базиса без "interaction" — легаси-глобальные функции
        try {
            HostPanel = GetPanel('Укажите панель, в которой делать выемку');
            Marker = GetObject('Укажите маркер: панель ИЛИ поставленное параметрическое отверстие/фурнитуру');
        } catch (eOldSel) {
            alert('ОШИБКА при выборе объектов: ' + eOldSel.message);
        }
    }
}

function SelectAndBuild() {
    SelectObjects();
    if (HostPanel && Marker) {
        try {
            MakeVyemka();
        } catch (e) {
            alert('ОШИБКА: ' + e.message);
        }
    }
}

MakeProperties(); // сначала диалог — чтобы ExtraDepth/Margin уже существовали
SelectAndBuild();  // первая пара — сразу, с реальными значениями из диалога
Action.Continue();

function MakeProperties() {
    Prop = Action.Properties;

    ExtraDepth = Prop.NewNumber('Дополнительная глубина, мм', 0);
    MarginWidth = Prop.NewNumber('Припуск по ширине маркера (U), мм', 0);
    MarginLength = Prop.NewNumber('Припуск по длине маркера (V), мм', 0);

    GrpAuthor = Prop.NewGroup('Автор скрипта');
    AuthorName = GrpAuthor.NewString('Автор', 'Виталий Ястов');
    AuthorLink = GrpAuthor.NewString('Все скрипты', 'boosty.to/vetalyty');

    SelectBtn = Prop.NewButton('Выбрать панель и маркер');
    SelectBtn.OnClick = function() {
        Action.AsyncExec(function() {
            SelectAndBuild();
        });
    };

    DoneBtn = Prop.NewButton('Готово');
    DoneBtn.OnClick = function() {
        Action.Finish(); // просто закрывает — построение уже произошло при выборе
    };
}

function MakeVyemka() {
    if (!HostPanel || !Marker) {
        alert('Панель или маркер не выбраны — пропускаю эту пару.');
        return;
    }

    var hasHoles = false, hasContour = false;
    try { hasHoles = !!(Marker.Holes && Marker.Holes.Count > 0); } catch (e1) {}
    try { hasContour = !!(Marker.Contour && Marker.Contour.Count > 0); } catch (e2) {}

    if (hasHoles) {
        MakeFromFastenerHole();
    } else if (hasContour) {
        MakeFromPanelMarker();
    } else {
        alert('Не удалось определить тип маркера (нет ни Holes, ни Contour).');
    }
}

// ---------- Вариант 1: маркер — панель произвольной формы ----------
function MakeFromPanelMarker() {
    var Depth = Marker.Thickness + ExtraDepth.Value;

    var dx = Marker.GMax.x - Marker.GMin.x;
    var dy = Marker.GMax.y - Marker.GMin.y;
    var dz = Marker.GMax.z - Marker.GMin.z;
    var thicknessAxis = (dx <= dy && dx <= dz) ? 'x' : (dy <= dx && dy <= dz) ? 'y' : 'z';
    var midx = (Marker.GMax.x + Marker.GMin.x) / 2;
    var midy = (Marker.GMax.y + Marker.GMin.y) / 2;
    var midz = (Marker.GMax.z + Marker.GMin.z) / 2;

    function to3D(u, v) {
        if (thicknessAxis == 'x') return NewVector(midx, u, v);
        if (thicknessAxis == 'y') return NewVector(u, midy, v);
        return NewVector(u, v, midz);
    }

    var n = Marker.Contour.Count;
    var lines = [];
    for (var i = 0; i < n; i++) {
        var el = Marker.Contour[i];
        var isLine = false;
        try { isLine = el.IsLine(); } catch (eIs) { isLine = false; }
        if (isLine) lines.push(el);
    }
    if (lines.length < 3) {
        alert('Не удалось прочитать форму маркера (нужно минимум 3 линейных точки, найдено ' + lines.length + ').');
        return;
    }

    // Цепочка по совпадению концов (отрезки не гарантированно идут в одном направлении)
    var UV = [{ u: lines[0].Pos1.x, v: lines[0].Pos1.y }];
    var cur = lines[0].Pos2;
    for (var i = 1; i < lines.length; i++) {
        var el = lines[i];
        var d1 = Math.abs(el.Pos1.x - cur.x) + Math.abs(el.Pos1.y - cur.y);
        var d2 = Math.abs(el.Pos2.x - cur.x) + Math.abs(el.Pos2.y - cur.y);
        UV.push({ u: cur.x, v: cur.y });
        cur = (d1 < d2) ? el.Pos2 : el.Pos1;
    }

    var us = [], vs = [];
    for (var i = 0; i < UV.length; i++) { us.push(UV[i].u); vs.push(UV[i].v); }
    var uMin = Math.min.apply(null, us), uMax = Math.max.apply(null, us);
    var vMin = Math.min.apply(null, vs), vMax = Math.max.apply(null, vs);
    var uCenter = (uMin + uMax) / 2, vCenter = (vMin + vMax) / 2;
    var halfU = (uMax - uMin) / 2, halfV = (vMax - vMin) / 2;

    var scaleU = (halfU > 0 && MarginWidth.Value != 0) ? (halfU + MarginWidth.Value) / halfU : 1;
    var scaleV = (halfV > 0 && MarginLength.Value != 0) ? (halfV + MarginLength.Value) / halfV : 1;

    var P = [];
    for (var i = 0; i < UV.length; i++) {
        var u2 = uCenter + (UV[i].u - uCenter) * scaleU;
        var v2 = vCenter + (UV[i].v - vCenter) * scaleV;
        var local3D = to3D(u2, v2);
        var world = Marker.ToGlobal(local3D);
        P.push(HostPanel.ToObject(world));
    }

    var markerCenterWorld = Marker.ToGlobal(NewVector(midx, midy, midz));
    var centerHost = HostPanel.ToObject(markerCenterWorld);
    var nearFront = centerHost.z < HostPanel.Thickness / 2;

    BuildCut(function(Cut) {
        for (var i = 0; i < P.length; i++) {
            var p1 = P[i];
            var p2 = P[(i + 1) % P.length];
            Cut.Contour.AddLine(p1.x, p1.y, p2.x, p2.y);
        }
    }, Depth, nearFront);
}

// ---------- Вариант 2: маркер — фурнитура/параметрическое отверстие ----------
function MakeFromFastenerHole() {
    var h = Marker.Holes.Items[0];

    var diameter = (h.Diameter !== undefined && h.Diameter !== null) ? h.Diameter : (h.Radius * 2);
    var extraRadius = (MarginWidth.Value + MarginLength.Value) / 2;
    var radius = diameter / 2 + extraRadius;

    var worldPos = Marker.ToGlobal(h.Position);
    var centerHost = HostPanel.ToObject(worldPos);
    var nearFront = centerHost.z < HostPanel.Thickness / 2;

    var isThrough = false;
    try { isThrough = (h.DrillMode === fastenerOperations.holeDrillMode.through); } catch (eDM) {}

    var Depth = isThrough
        ? (HostPanel.Thickness + ExtraDepth.Value)
        : ((h.Depth || 0) + ExtraDepth.Value);

    BuildCut(function(Cut) {
        Cut.Contour.AddCircle(centerHost.x, centerHost.y, radius);
    }, Depth, nearFront);
}

// ---------- Общая часть: сам рез ----------
function BuildCut(fillContour, Depth, nearFront) {
    StartEditing(HostPanel);
    Cut = HostPanel.AddCut('Выемка по маркеру');
    Cut.CutType = 2;
    Cut.Thickness = nearFront ? Depth : -Depth;

    fillContour(Cut);

    HostPanel.Build();
    // Action.Commit() убрана — похоже, именно она вызывала краш Базиса и
    // залипание сессии (следующий запуск скрипта переставал стартовать).
    // Компромисс: без неё Escape снова откатывает уже сделанные постройки —
    // не жать Escape посреди пачки, закрывать обычным крестиком.
}
