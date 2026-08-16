// ============================================================
// √абаритный блок Ч по выделению (объект/блок/сборка или несколько)
// строит один параллелепипед точно по мировому габариту выделенного.
// ≈сли ничего не выделено Ч берЄт габарит всего проекта (Model).
//
// ќсь совпадени€: результат Ч axis-aligned бокс в ћ»–ќ¬џ’ координатах
// (используем GabMin/GabMax объекта, а не GMin/GMax Ч последние в его
// собственной повЄрнутой Ћ— , нам нужен именно мировой габарит).
//
// “ехнически Ч Extrusion: контур-пр€моугольник в плоскости ширина-
// высота (X-Y), толщина (глубина/Z) Ч через Ext.Orient(AxisZ, AxisY),
// см. `Ѕазис_справочник_дл€_Claude.md`. StartEditing() сразу после
// AddExtrusion() и Build() в конце Ч об€зательны (задокументированный
// баг: без этого построение тихо не срабатывает).
// ============================================================

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

        var Ext = AddExtrusion('√абаритный блок');
        StartEditing(Ext);
        Ext.Contour.AddRectangle(MinX, MinY, MaxX, MaxY);
        Ext.Orient(AxisZ, AxisY);
        Ext.Thickness = D;
        Ext.Build();
        Ext.PositionZ = MinZ;
        Ext.Name = '√абаритный блок';

        // служебные флаги Ч не считать материалом/деталью в смете,
        // раскрое, „ѕ”, спецификации; зелЄный цвет (0x00FF00) Ч как у
        // насто€щего нативного объекта "√абаритна€ рамка" (TModelLimits,
        // см. подробности в √абаритна€_рамка.js Ч его самого через
        // скрипт не создать, публичного конструктора нет)
        try { Ext.Color = 65280; } catch (e1) {}
        try { Ext.UseInEstimate = false; } catch (e2) {}
        try { Ext.UseInCutting = false; } catch (e3) {}
        try { Ext.UseInCNC = false; } catch (e4) {}
        try { Ext.UseInDocs = false; } catch (e5) {}
        try { Ext.UseInInspection = false; } catch (e6) {}

        alert('√отово: ' + W.toFixed(1) + ' x ' + H.toFixed(1) + ' x ' + D.toFixed(1) +
              ' мм (по габариту ' + SourceName + ').');
    }

} catch (eBuild) {
    alert('ќшибка построени€ габаритного блока: ' + eBuild.message);
}
