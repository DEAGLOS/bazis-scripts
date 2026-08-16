// ============================================================
// √абаритна€ рамка Ч по выделению (объект/блок/сборка или несколько)
// строит ѕ–ќ¬ќЋќ„Ќџ…  ј– ј— (только 12 рЄбер, не сплошное тело) точно
// по мировому габариту выделенного Ч в отличие от "√абаритный_блок.js"
// (сплошна€ Extrusion) Ќ≈ закрывает обзор на саму модель изнутри.
// ≈сли ничего не выделено Ч берЄт габарит всего проекта (Model).
//
// ѕќƒ“¬≈–∆ƒ≈Ќќ диагностикой (for...in дамп реального объекта): нативна€
// "√абаритна€ рамка" в Ѕазисе Ч это class TModelLimits, синглтон,
// всегда один и висит пр€мо на Model (Owner.Name === "Model"), с
// поддержкой √-образных помещений (LCornerAngle/LDistance в LimitSize)
// Ч это объект габаритов ѕќћ≈ў≈Ќ»я целиком, не "коробка под выделение".
// ѕубличного конструктора под TModelLimits в скриптовом API нет Ч
// создать именно такой нативный объект через скрипт нельз€. ѕоэтому
// ниже Ч свой аналог на обычных Extrusion, визуально и по служебным
// флагам (см. MarkAsService) похожий, но другого класса.
//
// –еализаци€: каждое из 12 рЄбер Ч тонкий Extrusion-стержень
// (квадратное сечение EDGE_THICKNESS x EDGE_THICKNESS), выт€нутый
// вдоль ребра. StartEditing()+Build() после AddExtrusion Ч
// об€зательны (см. Ѕазис_справочник_дл€_Claude.md).
// ============================================================

var EDGE_THICKNESS = 3; // мм, толщина стержн€ каркаса Ч можно поправить

function BuildEdge(P1, P2, Index) {
    // направление ребра
    var Dir = { x: P2.x - P1.x, y: P2.y - P1.y, z: P2.z - P1.z };
    var Len = Math.sqrt(Dir.x * Dir.x + Dir.y * Dir.y + Dir.z * Dir.z);
    if (Len < 0.01) return; // вырожденное ребро (габарит нулевой по этой оси)

    var Ext = AddExtrusion('–амка ребро ' + Index);
    StartEditing(Ext);
    var Half = EDGE_THICKNESS / 2;
    Ext.Contour.AddRectangle(-Half, -Half, Half, Half);

    if (Math.abs(Dir.x) >= Math.abs(Dir.y) && Math.abs(Dir.x) >= Math.abs(Dir.z)) {
        // ребро идЄт вдоль X Ч толщина выт€гиваетс€ по X
        Ext.Orient(AxisX, AxisY);
    } else if (Math.abs(Dir.y) >= Math.abs(Dir.z)) {
        // ребро идЄт вдоль Y
        Ext.Orient(AxisY, AxisZ);
    } else {
        // ребро идЄт вдоль Z
        Ext.Orient(AxisZ, AxisY);
    }
    Ext.Thickness = Len;
    Ext.Build();

    // позиционируем начало стержн€ в P1 (стержень строитс€ в
    // положительном направлении своей оси выдавливани€ от объекта)
    Ext.PositionX = P1.x;
    Ext.PositionY = P1.y;
    Ext.PositionZ = P1.z;

    MarkAsService(Ext);
}

// ѕомечаем объект как служебный Ч не считать материалом/деталью.
// ‘лаги и зелЄный цвет (0x00FF00 = 65280) подсмотрены у насто€щего
// нативного объекта "√абаритна€ рамка" (TModelLimits) через
// ƒиагностика_√абаритна€_рамка_v2.js Ч сам этот класс через скрипт не
// создать (нет публичного конструктора), но эти флаги Ч обычные
// свойства любого объекта, и на них закрыт исходный вопрос "тело
// попадает в смету/раскрой".
function MarkAsService(Obj) {
    try { Obj.Color = 65280; } catch (e1) {}
    try { Obj.UseInEstimate = false; } catch (e2) {}
    try { Obj.UseInCutting = false; } catch (e3) {}
    try { Obj.UseInCNC = false; } catch (e4) {}
    try { Obj.UseInDocs = false; } catch (e5) {}
    try { Obj.UseInInspection = false; } catch (e6) {}
}

try {

    var MinX, MinY, MinZ, MaxX, MaxY, MaxZ;
    var SourceName = 'проект';

    if (Model.SelectionCount > 0) {
        for (var si = 0; si < Model.SelectionCount; si++) {
            var Sel = Model.Selections[si];
            var GMn = Sel.GabMin;
            var GMx = Sel.GabMax;
            if (MinX === undefined) {
                MinX = GMn.x; MinY = GMn.y; MinZ = GMn.z;
                MaxX = GMx.x; MaxY = GMx.y; MaxZ = GMx.z;
                SourceName = Sel.Name;
            } else {
                if (GMn.x < MinX) MinX = GMn.x;
                if (GMn.y < MinY) MinY = GMn.y;
                if (GMn.z < MinZ) MinZ = GMn.z;
                if (GMx.x > MaxX) MaxX = GMx.x;
                if (GMx.y > MaxY) MaxY = GMx.y;
                if (GMx.z > MaxZ) MaxZ = GMx.z;
            }
        }
        if (Model.SelectionCount > 1) SourceName = 'выделенного (' + Model.SelectionCount + ' объектов)';
    } else {
        var PMn = Model.GMin;
        var PMx = Model.GMax;
        MinX = PMn.x; MinY = PMn.y; MinZ = PMn.z;
        MaxX = PMx.x; MaxY = PMx.y; MaxZ = PMx.z;
    }

    var W = MaxX - MinX;
    var H = MaxY - MinY;
    var D = MaxZ - MinZ;

    if (W <= 0 || H <= 0 || D <= 0) {
        alert('Ќе удалось определить габарит (нулевой или отрицательный размер). ѕроверьте выделение.');
    } else {

        // 8 углов коробки Ч тот же пор€док битов, что и в Corners
        // JSON-экспортЄра вьювера (0=min,min,min Е 7=max,max,max), дл€
        // единообрази€ с остальным проектом.
        var C = [
            { x: MinX, y: MinY, z: MinZ }, // 0
            { x: MaxX, y: MinY, z: MinZ }, // 1
            { x: MinX, y: MaxY, z: MinZ }, // 2
            { x: MaxX, y: MaxY, z: MinZ }, // 3
            { x: MinX, y: MinY, z: MaxZ }, // 4
            { x: MaxX, y: MinY, z: MaxZ }, // 5
            { x: MinX, y: MaxY, z: MaxZ }, // 6
            { x: MaxX, y: MaxY, z: MaxZ }  // 7
        ];

        var Edges = [
            [0, 1], [0, 2], [0, 4], [1, 3],
            [1, 5], [2, 3], [2, 6], [3, 7],
            [4, 5], [4, 6], [5, 7], [6, 7]
        ];

        for (var ei = 0; ei < Edges.length; ei++) {
            BuildEdge(C[Edges[ei][0]], C[Edges[ei][1]], ei);
        }

        alert('√отово: рамка ' + W.toFixed(1) + ' x ' + H.toFixed(1) + ' x ' + D.toFixed(1) +
              ' мм (по габариту ' + SourceName + ').');
    }

} catch (eBuild) {
    alert('ќшибка построени€ габаритной рамки: ' + eBuild.message);
}
