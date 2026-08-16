// ==================================================
// Шкаф-пенал: нижний модуль + верхний модуль
// Оси:  X = ширина, Y = высота, Z = глубина (0 = перед, D = зад)
//
// v4:
// - способ крепления задней стенки — выбор:
//     0) В паз       — паз в боковинах/верхе/низе, шире стенки на 1мм,
//                       на заданном отступе от заднего края
//     1) Накладная   — крепится снаружи на задний торец, короб на всю глубину
//     2) Вкладная    — вставлена между боковин впритык, боковины короче на толщину стенки
// - правая боковина зеркалится от левой (AddSymmetry) — если на левой
//   вырезан паз, он автоматически переносится и на правую
// ==================================================

var FileOptions = 'Шкаф_пенал_настройки.xml';

MakeProperties();
Build();
Action.Continue(); // не завершать действие — держать диалог открытым

function MakeProperties() {
    Prop = Action.Properties;

    Width      = Prop.NewNumber('Ширина, мм', 500);
    Depth      = Prop.NewNumber('Глубина, мм', 600);
    HBottom    = Prop.NewNumber('Высота нижнего модуля, мм', 1500);
    HTop       = Prop.NewNumber('Высота верхнего модуля, мм', 1100);

    Korpus = Prop.NewMaterial('Корпус');
    Shelf  = Prop.NewMaterial('Полки');

    DivPos     = Prop.NewNumber('Перегородка от левого края, мм', 216);
    ShelfLeft  = Prop.NewNumber('Полок слева (низ)', 3);
    ShelfRight = Prop.NewNumber('Полок справа (низ)', 4);
    ShelfTop   = Prop.NewNumber('Полок в верхнем модуле', 0);

    // задняя стенка
    Back = Prop.NewBool('Задняя стенка', true);
    Back.OnChange = function() { Back.ChildrenEnabled = Back.Value; };
    BackMat  = Back.NewMaterial('Материал задней стенки');
    BackType = Back.NewCombo('Способ крепления', 'В паз\nНакладная\nВкладная');

    PazOffset = Back.NewNumber('Паз: расстояние от заднего края, мм', 8);
    PazMinus  = Back.NewNumber('Паз: вычесть с габарита стенки, мм', 3);
    NaklMinus = Back.NewNumber('Накладная: вычесть с габарита, мм', 0);

    // кромка
    EdgeBanding = Prop.NewBool('Кромка', true);
    EdgeBanding.OnChange = function() { EdgeBanding.ChildrenEnabled = EdgeBanding.Value; };
    VisibleButt = EdgeBanding.NewButt('Кромка на видимых гранях');
    HiddenButt  = EdgeBanding.NewButt('Кромка на невидимых гранях');

    OkBtn = Prop.NewButton('Построить');
    OkBtn.Value = 'Ok';

    Prop.OnChange = function() {
        DeleteNewObjects();
        Build();
    };

    OkBtn.OnClick = function() {
        DeleteNewObjects();
        Build();
        Action.Commit();
        ViewAll();
        Action.Finish();
    };

    Action.Properties.Load(FileOptions);
    Action.OnFinish = function() {
        Action.Properties.Save(FileOptions);
    };
}

function Build() {
    var W  = Width.Value;
    var D  = Depth.Value;
    var HB = HBottom.Value;
    var HT = HTop.Value;

    BeginBlock('Нижний модуль');
        MakeCase(0, HB, W, D, true, DivPos.Value, ShelfLeft.Value, ShelfRight.Value);
    EndBlock();

    BeginBlock('Верхний модуль');
        MakeCase(HB, HB + HT, W, D, false, 0, 0, ShelfTop.Value);
    EndBlock();
}

function MakeCase(Y0, Y1, W, D, WithDivider, DivX, CountLeft, CountRight) {
    var BackThick = 0;
    if (Back.Value) {
        BackMat.SetActive();
        BackThick = ActiveMaterial.Thickness;
    }

    var SlotWidth = BackThick + 1; // ширина паза = толщина стенки + 1мм
    var Mode = Back.Value ? BackType.ItemIndex : -1; // 0=паз, 1=накладная, 2=вкладная, -1=без стенки

    // CaseD  — до какой глубины строятся боковины/верх/низ
    // InnerD — до какой глубины доходят полки/перегородка
    var CaseD, InnerD;
    if (Mode === 0) {          // в паз — короб на всю глубину, полки не доходят до паза
        CaseD  = D;
        InnerD = D - PazOffset.Value - SlotWidth;
    } else if (Mode === 1) {   // накладная — короб на всю глубину, стенка снаружи
        CaseD  = D;
        InnerD = D;
    } else if (Mode === 2) {   // вкладная — короб короче на толщину стенки
        CaseD  = D - BackThick;
        InnerD = CaseD;
    } else {                   // без задней стенки вообще
        CaseD  = D;
        InnerD = D;
    }

    var Panels = [];

    Korpus.SetActive();
    var T = ActiveMaterial.Thickness;

    var LeftSide = AddVertPanel(0, Y0, CaseD, Y1, 0);
    LeftSide.Name = 'Боковина левая';

    if (Mode === 0) {
        // паз в левой боковине — режем ДО зеркалирования,
        // чтобы паз автоматически перенёсся и на правую боковину
        CutGroove(LeftSide, CaseD - PazOffset.Value - SlotWidth, 0, SlotWidth, Y1 - Y0);
    }
    Panels.push(LeftSide);

    var RightSide = AddSymmetry(LeftSide, NewVector(W / 2, 0, 0), AxisX);
    RightSide.Name = 'Боковина правая';
    Panels.push(RightSide);

    var Bottom = AddHorizPanel(T, 0, W - T, CaseD, Y0);
    Bottom.Name = 'Дно';
    if (Mode === 0) {
        CutGroove(Bottom, 0, CaseD - PazOffset.Value - SlotWidth, W - 2 * T, SlotWidth);
    }
    Panels.push(Bottom);

    var Top = AddHorizPanel(T, 0, W - T, CaseD, Y1 - T);
    Top.Name = 'Крышка';
    if (Mode === 0) {
        CutGroove(Top, 0, CaseD - PazOffset.Value - SlotWidth, W - 2 * T, SlotWidth);
    }
    Panels.push(Top);

    if (WithDivider) {
        var Divider = AddVertPanel(0, Y0 + T, InnerD, Y1 - T, DivX);
        Divider.Name = 'Перегородка';
        Panels.push(Divider);

        Panels = Panels.concat(MakeShelves(T, DivX, InnerD, Y0 + T, Y1 - T, CountLeft));
        Panels = Panels.concat(MakeShelves(DivX + T, W - T, InnerD, Y0 + T, Y1 - T, CountRight));
    } else {
        Panels = Panels.concat(MakeShelves(T, W - T, InnerD, Y0 + T, Y1 - T, CountRight));
    }

    // задняя стенка
    if (Mode === 0) {
        var BW = W - PazMinus.Value;
        var BH = (Y1 - Y0) - PazMinus.Value;
        var Bz = CaseD - PazOffset.Value - SlotWidth / 2 - BackThick / 2;
        BackMat.SetActive();
        var BackPanel = AddFrontPanel((W - BW) / 2, Y0 + ((Y1 - Y0) - BH) / 2,
                                       (W - BW) / 2 + BW, Y0 + ((Y1 - Y0) - BH) / 2 + BH, Bz);
        BackPanel.Name = 'Задняя стенка (в паз)';
    } else if (Mode === 1) {
        var BW = W - NaklMinus.Value;
        var BH = (Y1 - Y0) - NaklMinus.Value;
        BackMat.SetActive();
        var BackPanel = AddFrontPanel((W - BW) / 2, Y0 + ((Y1 - Y0) - BH) / 2,
                                       (W - BW) / 2 + BW, Y0 + ((Y1 - Y0) - BH) / 2 + BH, CaseD - BackThick);
        BackPanel.Name = 'Задняя стенка (накладная)';
    } else if (Mode === 2) {
        BackMat.SetActive();
        var BackPanel = AddFrontPanel(0, Y0, W, Y1, CaseD);
        BackPanel.Name = 'Задняя стенка (вкладная)';
    }

    for (var i = 0; i < Panels.length; i++) {
        ApplyEdgeBanding(Panels[i]);
    }
}

// Режет прямоугольный паз в панели.
// LineX1,LineY1 -> LineX2,LineY2 задаются так: одна из пар совпадает
// (линия идёт строго по X либо строго по Y), Width/Height — размер паза
// поперёк линии. Координаты — в локальной системе контура панели.
// ВНИМАНИЕ: это адаптация одного примера (Моя первая тумбочка),
// направление и точный отступ стоит проверить и подправить по месту.
function CutGroove(Panel, X, Y, W, H) {
    var Cut = Panel.AddCut('Паз');
    var Traj = Cut.Trajectory;
    if (W > H) {
        // паз вдоль X (для верха/низа)
        Traj.AddLine(X, Y + H / 2, X + W, Y + H / 2);
        Cut.Contour.AddRectangle(0, -H / 2, 0, H / 2);
    } else {
        // паз вдоль Y (для боковины)
        Traj.AddLine(X + W / 2, Y, X + W / 2, Y + H);
        Cut.Contour.AddRectangle(-W / 2, 0, W / 2, 0);
    }
    Panel.Build();
}

function MakeShelves(X0, X1, D, Y0, Y1, Count) {
    var Result = [];
    if (Count <= 0) return Result;
    Shelf.SetActive();
    var T = ActiveMaterial.Thickness;
    var SectionHeight = Y1 - Y0;
    var Step = (SectionHeight - Count * T) / (Count + 1);
    var PosY = Y0;
    for (var k = 0; k < Count; k++) {
        PosY += Step;
        var ShelfPanel = AddHorizPanel(X0, 0, X1, D, PosY);
        ShelfPanel.Name = 'Полка';
        Result.push(ShelfPanel);
        PosY += T;
    }
    return Result;
}

function ApplyEdgeBanding(Panel) {
    if (!EdgeBanding.Value) return;
    var Changed = false;
    for (var i = 0; i < Panel.Contour.Count; i++) {
        var Butt = Panel.IsButtVisible(i, 5) ? VisibleButt : HiddenButt;
        Panel.AddButt(Butt, i);
        Changed = true;
    }
    if (Changed) Panel.Build();
}
