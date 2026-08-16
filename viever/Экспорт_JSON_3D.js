var ConfigFile = '\u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b_\u0442\u0438\u043f\u044b.json'; // своя сериализация через fs (не Action.Properties.Save/Load —
                                          // недоступен у UI.components-форм)
var TYPES_LIST = "\u041d\u0435 \u0437\u0430\u0434\u0430\u043d\u043e\n\u0414\u0421\u041f\n\u041b\u0414\u0421\u041f\n\u041c\u0414\u0424\n\u0425\u0440\u043e\u043c\n\u0421\u0442\u0435\u043a\u043b\u043e\n\u0417\u0435\u0440\u043a\u0430\u043b\u043e\n\u041c\u0435\u0442\u0430\u043b\u043b\n\u041f\u043b\u0430\u0441\u0442\u0438\u043a\n\u0422\u043a\u0430\u043d\u044c";
var TYPES_ARRAY = TYPES_LIST.split('\n');
var DEFAULT_TYPE_INDEX = 0; // "\u041d\u0435 \u0437\u0430\u0434\u0430\u043d\u043e" — новый материал по умолчанию НЕ классифицирован
var UNDEFINED_COLOR = 16711935; // пёстро-розовый/магента (BGR) — сигнал "\u0446\u0432\u0435\u0442 \u043d\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d, \u043f\u043e\u043f\u0440\u0430\u0432\u044c \u0440\u0443\u043a\u0430\u043c\u0438"
var IGNORE_NAMES = { "\u0433\u0430\u0431\u0430\u0440\u0438\u0442\u043d\u0430\u044f \u0440\u0430\u043c\u043a\u0430": true }; // служебные объекты самого Базиса — не деталь

function R(n) {
    return Math.round(n * 1000) / 1000;  // округление до 3 знаков (микроны)
}

function GetCorners(Obj) {
    var mn = Obj.GMin;
    var mx = Obj.GMax;
    var local = [
        NewVector(mn.x, mn.y, mn.z),
        NewVector(mx.x, mn.y, mn.z),
        NewVector(mn.x, mx.y, mn.z),
        NewVector(mx.x, mx.y, mn.z),
        NewVector(mn.x, mn.y, mx.z),
        NewVector(mx.x, mn.y, mx.z),
        NewVector(mn.x, mx.y, mx.z),
        NewVector(mx.x, mx.y, mx.z)
    ];
    var world = [];
    for (var i = 0; i < local.length; i++) {
        var p = Obj.ToGlobal(local[i]);
        world.push([R(p.x), R(p.y), R(p.z)]);
    }
    return world;
}

function HasSelection(Obj) {
    // рекурсивная проверка — есть ли хоть один выделенный объект внутри
    // (или сам объект выделен, если это не группа). ВАЖНО: проверяем
    // .Selected и на самом блоке/группе тоже — в Базисе выделение блока
    // целиком (клик по нему в сцене) может помечать выделенным сам
    // объект-List, а не каждого потомка внутри по отдельности
    try { if (Obj.Selected) return true; } catch (e) {}
    if (Obj.List) {
        for (var i = 0; i < Obj.Count; i++) {
            if (HasSelection(Obj[i])) return true;
        }
    }
    return false;
}

function BaseName(name) {
    // MaterialName может нести артикул через \r ("\u0418\u043c\u044f\r\u042600012345") —
    // для группировки/подписи в диалоге и для сопоставления с .dae
    // нужна только часть до \r
    return name ? name.split('\r')[0] : null;
}

// ============================================================
// Шаг 1 — собрать уникальные материалы ВЫДЕЛЕННОЙ модели (или всей
// сцены, если ничего не выделено) — и базовый материал панели, и
// материалы облицовки (Plastics), раз у накладок цвет свой и его тоже
// нельзя достать автоматически. Заодно запоминаем РЕАЛЬНЫЙ DiffuseColor,
// если материал хоть раз встретился как обычный (не накладка) —
// пригодится как стартовый цвет вместо пёстро-розового.
// ============================================================
var UniqueMaterials = {}; // базовое имя -> true
var KnownColors = {};     // базовое имя -> реальный DiffuseColor, если нашёлся
var KnownTextures = {};   // базовое имя -> путь к текстуре, если нашёлся (только у базовых материалов —
                           // у накладок Plastics текстуры физически не бывает, PathAbsolute там недоступен)

function IsServiceMaterialName(name) {
    // служебные материалы Базиса (например "~$$$ModelLimits" — материал
    // объекта "Габаритная рамка") начинаются с ~ — отдельный фильтр,
    // независимый от имени ОБЪЕКТА (IGNORE_NAMES), на случай если у
    // конкретного объекта имя не совпало буквально
    return !!(name && name.charAt(0) === '~');
}

function CollectMaterials(Obj) {
    if (Obj.List) {
        for (var i = 0; i < Obj.Count; i++) CollectMaterials(Obj[i]);
        return;
    }
    if (Obj.Name && IGNORE_NAMES[Obj.Name.toLowerCase()]) return; // служебный объект — пропустить
    try {
        var mn = BaseName(Obj.Material.MaterialName);
        if (mn && !IsServiceMaterialName(mn)) {
            UniqueMaterials[mn] = true;
            if (KnownColors[mn] === undefined) {
                try { KnownColors[mn] = Obj.Material.DiffuseColor; } catch (eC) {}
            }
            if (KnownTextures[mn] === undefined) {
                try {
                    var tp = Obj.Material.PathAbsolute();
                    if (tp) KnownTextures[mn] = tp;
                } catch (eT) {}
            }
        }
    } catch (e) {}
    try {
        if (Obj.Plastics && Obj.Plastics.Count > 0) {
            for (var pi = 0; pi < Obj.Plastics.Count; pi++) {
                var pm = BaseName(Obj.Plastics.Plastics[pi].Material);
                if (pm && !IsServiceMaterialName(pm)) UniqueMaterials[pm] = true; // цвет/текстура накладки не пытаемся достать — не выйдет
            }
        }
    } catch (e2) {}
}

var AnySelected = HasSelection(Model);
for (var mi = 0; mi < Model.Count; mi++) {
    var TopForCollect = Model[mi];
    if (AnySelected && !HasSelection(TopForCollect)) continue;
    CollectMaterials(TopForCollect);
}

// ============================================================
// Шаг 1.5 — своя загрузка прошлых назначений (тип+цвет) через fs —
// Action.Properties.Save/Load недоступен у UI.components-форм, поэтому
// сериализуем сами простым JSON рядом со скриптом.
// ============================================================
var SavedChoices = {}; // базовое имя материала -> {Category, Color}
try {
    if (fs.existsSync(ConfigFile)) {
        SavedChoices = JSON.parse(fs.readFileSync(ConfigFile, 'utf8'));
    }
} catch (eLoad) {
    SavedChoices = {};
}

// ============================================================
// Шаг 2 — отдельное окно. UI.components.NewForm() — доступно не на
// всех версиях Базиса (подтверждено: не работает минимум на Базис
// 2022, где большинство пользователей) — проверяем перед использованием
// и, если недоступно, откатываемся на докнутую панель Action.Properties
// (есть в любой версии). Оба пути ведут к одному и тому же результату —
// заполненным Combos/Colors, дальше код общий.
// ============================================================
var USING_NEW_UI = (typeof UI !== 'undefined' && UI.components && typeof UI.components.NewForm === 'function');

var Combos = {};
var Colors = {};
var TexChecks = {};
var MatForm = null;

if (USING_NEW_UI) {
    // ---- современный путь: отдельное растягиваемое окно, настоящий цветовой пикер ----
    MatForm = UI.components.NewForm();
    MatForm.Caption = '\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b \u043c\u043e\u0434\u0435\u043b\u0438';
    MatForm.Width = 600;
    MatForm.Height = 520;
    MatForm.ShowHint = true;

    // заголовок "\u0442\u0430\u0431\u043b\u0438\u0446\u044b" — три колонки, один раз сверху
    var COL1_X = 10, COL1_W = 220;   // тип материала
    var COL2_X = 240, COL2_W = 220;  // цвет материала
    var COL3_X = 470, COL3_W = 110;  // текстура

    var hdr1 = UI.components.NewLabel(MatForm, MatForm);
    hdr1.Caption = '\u0422\u0438\u043f \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430';
    hdr1.Left = COL1_X; hdr1.Top = 10; hdr1.Width = COL1_W; hdr1.Height = 16;
    var hdr2 = UI.components.NewLabel(MatForm, MatForm);
    hdr2.Caption = '\u0426\u0432\u0435\u0442 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430';
    hdr2.Left = COL2_X; hdr2.Top = 10; hdr2.Width = COL2_W; hdr2.Height = 16;
    var hdr3 = UI.components.NewLabel(MatForm, MatForm);
    hdr3.Caption = '\u0422\u0435\u043a\u0441\u0442\u0443\u0440\u0430';
    hdr3.Left = COL3_X; hdr3.Top = 10; hdr3.Width = COL3_W; hdr3.Height = 16;

    var y = 32;
    for (var matName in UniqueMaterials) {
        var saved = SavedChoices[matName];
        var hasTexture = KnownTextures[matName] !== undefined;

        var lbl = UI.components.NewLabel(MatForm, MatForm);
        lbl.Caption = matName;
        lbl.Left = 10; lbl.Top = y; lbl.Width = 570; lbl.Height = 16;
        y += 18;

        var combo = UI.components.NewComboBox(MatForm, MatForm);
        with (combo.Properties.Items) {
            Add('\u041d\u0435 \u0437\u0430\u0434\u0430\u043d\u043e'); Add('\u0414\u0421\u041f'); Add('\u041b\u0414\u0421\u041f'); Add('\u041c\u0414\u0424'); Add('\u0425\u0440\u043e\u043c');
            Add('\u0421\u0442\u0435\u043a\u043b\u043e'); Add('\u0417\u0435\u0440\u043a\u0430\u043b\u043e'); Add('\u041c\u0435\u0442\u0430\u043b\u043b'); Add('\u041f\u043b\u0430\u0441\u0442\u0438\u043a'); Add('\u0422\u043a\u0430\u043d\u044c');
        }
        var savedTypeIndex = saved ? TYPES_ARRAY.indexOf(saved.Category) : -1;
        combo.ItemIndex = (savedTypeIndex >= 0) ? savedTypeIndex : DEFAULT_TYPE_INDEX;
        combo.Left = COL1_X; combo.Top = y; combo.Width = COL1_W; combo.Height = 23;
        Combos[matName] = combo;

        var colorCombo = UI.components.NewColorComboBox(MatForm, MatForm);
        colorCombo.Properties.DefaultDescription = '\u0426\u0432\u0435\u0442 \u043d\u0435 \u0432\u044b\u0431\u0440\u0430\u043d';
        // родной цвет материала (если знаем) — отдельным пунктом СВЕРХУ
        // списка, чтобы можно было вернуться к нему после кастомного
        // выбора, не подбирая заново вручную. НЕ ПРОВЕРЕНО живьём — если
        // .Colors нет/называется иначе, просто тихо ничего не добавится
        // (try/catch), сам виджет всё равно останется рабочим.
        if (KnownColors[matName] !== undefined) {
            try {
                colorCombo.Properties.Colors.Add(KnownColors[matName], '\u0420\u043e\u0434\u043d\u043e\u0439 \u0446\u0432\u0435\u0442 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430');
            } catch (eColorList) {}
        }
        colorCombo.EditValue = saved ? saved.Color
            : (KnownColors[matName] !== undefined ? KnownColors[matName] : UNDEFINED_COLOR);
        colorCombo.Left = COL2_X; colorCombo.Top = y; colorCombo.Width = COL2_W; colorCombo.Height = 23;
        colorCombo.Enabled = !hasTexture;
        Colors[matName] = colorCombo;

        var texCheck = UI.components.NewCheckBox(MatForm, MatForm);
        texCheck.EditValue = hasTexture;
        texCheck.Enabled = false;
        texCheck.Left = COL3_X + 40; texCheck.Top = y; texCheck.Width = 20; texCheck.Height = 23;
        TexChecks[matName] = texCheck;

        y += 23 + 12;
    }

    var ExportBtn = UI.components.NewImageButton(MatForm, MatForm);
    ExportBtn.Caption = '\u042d\u043a\u0441\u043f\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c';
    ExportBtn.Left = 10; ExportBtn.Top = y; ExportBtn.Width = 285; ExportBtn.Height = 28;
    ExportBtn.OnClick = function() {
        var toSave = {};
        for (var mn in Combos) {
            var hasTex = KnownTextures[mn] !== undefined;
            toSave[mn] = {
                Category: TYPES_ARRAY[Combos[mn].ItemIndex],
                HasTexture: hasTex,
                TextureName: hasTex ? KnownTextures[mn] : null,
                Color: hasTex ? null : Colors[mn].EditValue
            };
        }
        try { fs.writeFileSync(ConfigFile, JSON.stringify(toSave)); } catch (eSave) {}
        DoExport();
        MatForm.Close();
    };

    var CancelBtn = UI.components.NewImageButton(MatForm, MatForm);
    CancelBtn.Caption = '\u041e\u0442\u043c\u0435\u043d\u0430';
    CancelBtn.Left = 305; CancelBtn.Top = y; CancelBtn.Width = 285; CancelBtn.Height = 28;
    CancelBtn.OnClick = function() {
        MatForm.Close();
    };

    MatForm.Height = y + 100;
    MatForm.OnClose = function() {
        Action.Finish();
    };

    MatForm.Show();

} else {
    // ---- запасной путь (старые версии Базиса, например 2022, где UI.
    // components недоступен): докнутая панель Action.Properties. Тут,
    // кстати, НАСТОЯЩИЙ NewColor работает (это NewForm/легаси-окну он
    // не давался, докнутой панели — всегда давался, с самого начала).
    // Своя сериализация через fs может тоже не быть доступна на старой
    // версии — используем штатный Action.Properties.Save/Load вместо неё.
    // ============================================================
    var LegacyConfigFile = '\u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b_\u0442\u0438\u043f\u044b_legacy.xml';
    Prop = Action.Properties;

    var GrpHeight = 70;
    var Y = 0;
    for (var matName2 in UniqueMaterials) {
        var hasTexture2 = KnownTextures[matName2] !== undefined;

        var Grp = Prop.NewGroup(matName2);
        Grp.SetLayout(1, Y, 520, GrpHeight);
        Grp.Align = AlignType.Top;
        Y += GrpHeight;

        var ComboW = Grp.NewCombo('\u0422\u0438\u043f \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430', TYPES_LIST);
        ComboW.SetLayout(1, 1, 340, 22);
        ComboW.Align = AlignType.Top;
        ComboW.ItemIndex = DEFAULT_TYPE_INDEX; // Action.Properties.Load ниже подтянет сохранённое поверх
        Combos[matName2] = ComboW;

        var ColorW = Grp.NewColor('\u0426\u0432\u0435\u0442 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430');
        ColorW.SetLayout(1, 23, 340, 22);
        ColorW.Align = AlignType.Top;
        ColorW.Value = (KnownColors[matName2] !== undefined) ? KnownColors[matName2] : UNDEFINED_COLOR;
        ColorW.Enabled = !hasTexture2;
        Colors[matName2] = ColorW;

        var TexW = Grp.NewBool('\u0422\u0435\u043a\u0441\u0442\u0443\u0440\u0430 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0430');
        TexW.SetLayout(1, 45, 340, 22);
        TexW.Align = AlignType.Top;
        TexW.Value = hasTexture2;
        TexW.Enabled = false;
        TexChecks[matName2] = TexW;
    }

    // ВАЖНО: без try/catch — если файла ещё нет (самый первый запуск на
    // этой машине/версии Базиса) или сам метод Save/Load ведёт себя не
    // так, как ожидалось (Базис бросает исключение вместо тихого no-op,
    // см. правило проекта), это падало ДО появления кнопок
    // "Экспортировать"/"Отмена" — панель оставалась пустой, а весь скрипт
    // тихо останавливался без единого сообщения. Похоже, это и есть
    // причина "не экспортирует" именно на Базис 2022 (там всегда этот,
    // legacy-путь).
    try { Prop.Load(LegacyConfigFile); } catch (eLoadLegacy) {} // тихая подгрузка прошлых назначений

    var ExportBtnLegacy = Prop.NewButton('\u042d\u043a\u0441\u043f\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c');
    ExportBtnLegacy.SetLayout(1, Y, 260, 26);
    ExportBtnLegacy.Align = AlignType.Top;
    ExportBtnLegacy.OnClick = function() {
        DoExport();
        try { Prop.Save(LegacyConfigFile); } catch (eSaveLegacy) {} // не должно мешать уже сделанному экспорту
        Action.Finish();
    };

    var CancelBtnLegacy = Prop.NewButton('\u041e\u0442\u043c\u0435\u043d\u0430');
    CancelBtnLegacy.SetLayout(1, Y + 26, 260, 26);
    CancelBtnLegacy.Align = AlignType.Top;
    CancelBtnLegacy.OnClick = function() {
        Action.Finish();
    };

    Action.Continue();
}

// ============================================================
// Шаг 3 — сама генерация JSON (запускается по кнопке "\u042d\u043a\u0441\u043f\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c")
// ============================================================
function GetMaterialInfo(rawName) {
    var name = BaseName(rawName);
    if (!name || !Combos[name]) return { Category: null, Color: null };
    var typeIdx = Combos[name].ItemIndex;
    // индекс 0 = "\u041d\u0435 \u0437\u0430\u0434\u0430\u043d\u043e" — считаем материал неклассифицированным,
    // категория в модель НЕ привязывается вообще, но цвет всё равно берём
    var category = (typeIdx === 0) ? null : TYPES_ARRAY[typeIdx];
    var color = USING_NEW_UI ? Colors[name].EditValue : Colors[name].Value;
    return {
        Category: category,
        Color: color
    };
}

// ============================================================
// Анимация открывания (двери/ящики) — данные живут на объекте-владельце
// панели (TFurnBlock), НЕ на самой панели. См. docs/animation.md.
// ============================================================
function GetOwnerCandidate(Obj) {
    // точное имя свойства-владельца в API Базиса НЕ подтверждено дословно —
    // перебираем кандидатов через duck typing, try/catch на каждом,
    // берём первый, что вернул что-то похожее на объект
    var Candidates = ['Owner', 'Parent', 'Block', 'ParentBlock'];
    for (var ci = 0; ci < Candidates.length; ci++) {
        try {
            var Cand = Obj[Candidates[ci]];
            if (Cand) return Cand;
        } catch (e) {}
    }
    return null;
}

function HasRealAxis(Anim) {
    // "настоящая" ось анимации — AxisStart/AxisEnd заданы, не совпадают
    // друг с другом и не оба нулевые (нулевая ось = анимация на этом
    // уровне просто не настроена)
    try {
        var s = Anim.AxisStart, e = Anim.AxisEnd;
        if (!s || !e) return false;
        if (s.x === 0 && s.y === 0 && s.z === 0 && e.x === 0 && e.y === 0 && e.z === 0) return false;
        if (s.x === e.x && s.y === e.y && s.z === e.z) return false;
        return true;
    } catch (e2) {
        return false;
    }
}

function CollectAnimationChain(Obj) {
    // поднимаемся по цепочке владельцев панели, собираем ВСЕ уровни с
    // настоящей осью анимации — у составных механизмов (складная дверь
    // и т.п.) таких уровней может быть НЕСКОЛЬКО вложенных, собираем все,
    // ближний уровень первым (дальняя поддержка составных механизмов во
    // вьювере пока не реализована — там анимируется только chain[0], но
    // данные собираем полностью на будущее).
    var Chain = [];
    var next = GetOwnerCandidate(Obj);
    var guard = 0; // защита от зацикливания на случай кольца владельцев — не более 50 уровней
    while (next && guard < 50) {
        guard++;
        try {
            var Anim = next.Animation;
            if (Anim && HasRealAxis(Anim)) {
                var s = Anim.AxisStart, e = Anim.AxisEnd;
                // КРИТИЧНО: перевод в мировые координаты ОБЯЗАТЕЛЬНО через
                // next.ToGlobal(NewVector(x,y,z)) — без обёртки NewVector
                // трансформация не срабатывает по-настоящему (проверено на
                // практике — координата "глубины" оставалась как в
                // локальных координатах блока).
                var gs = next.ToGlobal(NewVector(s.x, s.y, s.z));
                var ge = next.ToGlobal(NewVector(e.x, e.y, e.z));
                var Level = {
                    AxisStart: [R(gs.x), R(gs.y), R(gs.z)],
                    AxisEnd: [R(ge.x), R(ge.y), R(ge.z)]
                };
                // остальные поля — точные имена свойств на Anim НЕ
                // подтверждены дословно (аналогично GetOwnerCandidate
                // выше), читаем в try/catch по отдельности; вьювер сам
                // подставляет разумные дефолты, если поле не пришло
                // (AnimType по умолчанию — поворотная, Duration — 1с)
                try { Level.AnimType = Anim.AnimType; } catch (eAT) { Level.AnimType = null; }
                try { Level.DoorAngle = Anim.DoorAngle; } catch (eDA) { Level.DoorAngle = null; }
                try { Level.Distance = Anim.Distance; } catch (eDI) { Level.Distance = null; }
                try { Level.DoorShift = Anim.DoorShift; } catch (eDS) { Level.DoorShift = null; }
                try { Level.Duration = Anim.Duration; } catch (eDU) { Level.Duration = null; }
                Chain.push(Level);
            }
        } catch (eLevel) {}
        next = GetOwnerCandidate(next);
    }
    return Chain;
}

function ProcessObject(Obj, GroupName, ForceInclude) {
    if (Obj.List) {
        // ВАЖНО: различаем "этот блок выделен целиком САМ" (тогда дальше
        // экспортируем всё внутри без дальнейшей фильтрации — реальные
        // листовые детали внутри выделенного блока обычно НЕ помечены
        // .Selected каждая по отдельности, только сам блок) от "выделено
        // что-то глубоко внутри, а этот блок просто по пути" (тогда
        // продолжаем сужать через HasSelection на каждом ребёнке). Раньше
        // фильтровали на каждом уровне безусловно — ломало экспорт целиком
        // выделенных блоков (все листья внутри отсеивались как невыделенные).
        var SelfSelected = false;
        try { SelfSelected = !!Obj.Selected; } catch (eSelf) {}
        var PassDown = ForceInclude || SelfSelected;

        for (var i = 0; i < Obj.Count; i++) {
            var Child = Obj[i];
            if (!PassDown && AnySelected && !HasSelection(Child)) continue;
            ProcessObject(Child, GroupName, PassDown);
        }
    } else {
        if (Obj.Name && IGNORE_NAMES[Obj.Name.toLowerCase()]) return; // служебный объект — пропустить
        var Line = {};
        Line.Group = GroupName; // имя верхнеуровневого блока (или null — объект вне блока)
        Line.Name = Obj.Name;
        Line.ArtPos = Obj.ArtPos;

        try {
            Line.Size = [R(Obj.GSize.x), R(Obj.GSize.y), R(Obj.GSize.z)];
        } catch (e) {
            Line.Size = null;
            Line.SizeError = e.message;
        }

        try {
            Line.Corners = GetCorners(Obj);
        } catch (e) {
            Line.Corners = null;
            Line.CornersError = e.message;
        }

        try {
            Line.Color = Obj.Material.DiffuseColor;
        } catch (e) {
            Line.Color = null;
        }

        try {
            // ВАЖНО: у TMaterial поле называется MaterialName, не Name —
            // на первой попытке использовалось .Name, из-за чего падало
            // исключением на КАЖДОМ объекте (Базис не прощает
            // обращение к несуществующему свойству — тихо не возвращает
            // undefined, как обычный JS-объект, а бросает ошибку).
            Line.MaterialName = Obj.Material.MaterialName;
        } catch (e) {
            Line.MaterialName = null;
        }

        try {
            // тело выдавливания (профиль/брус, Extrusion) vs обычная плоская
            // панель — вьювер по этому флагу выбирает другой UV-разворот
            // стенок (по периметру профиля, а не по кромке) и включает
            // отдельный шейдер-дискард для "Разреза" на стенках (обычный
            // material.visible не годится для замкнутого кольца стенок, у
            // него нет единого "перед/зад", см. docs/materials.md). ГИПОТЕЗА,
            // НЕ подтверждена дословно — читаем нативное поле Obj.IsExtrusion
            // напрямую по аналогии с остальными try/catch-полями; если у
            // реального объекта его нет/называется иначе, тихо останется
            // false (сегодняшнее поведение, не хуже, чем было).
            Line.IsExtrusion = !!Obj.IsExtrusion;
        } catch (e) {
            Line.IsExtrusion = false;
        }

        // тип+цвет из диалога — для БАЗОВОГО материала панели. Цвет тут
        // практически всегда не понадобится (Color/DiffuseColor выше уже
        // рабочий), но заполняем для единообразия с Plastics ниже.
        var baseInfo = GetMaterialInfo(Line.MaterialName);
        Line.MaterialCategory = baseInfo.Category;
        Line.MaterialColorFallback = baseInfo.Color;

        try {
            // путь к текстуре материала — напрямую, без сопоставления
            // с библиотекой материалов .dae по имени
            Line.TexturePath = Obj.Material.PathAbsolute();
        } catch (e) {
            Line.TexturePath = null;
        }

        try {
            // направление текстуры на панели: 0=не задана, 1=горизонтально,
            // 2=вертикально (Panel.TextureOrientation, TS-декларации Базиса)
            Line.TextureOrientation = Obj.TextureOrientation;
        } catch (e) {
            Line.TextureOrientation = null;
        }

        try {
            // облицовка пласти отдельным материалом (Panel.Plastics) —
            // накладной материал/декор поверх базового, своя толщина,
            // общая кромка на весь "\u043f\u0438\u0440\u043e\u0433". Side (0/1) — подтверждено
            // диагностикой, какая сторона панели. Цвет/текстура самой
            // накладки скрипту НЕ доступны (DiffuseColor/Path/
            // MaterialObject — всё undefined, проверено) — поэтому тип+
            // цвет берём из того же диалога, что и для обычных
            // материалов (пёстро-розовый по умолчанию, если пользователь
            // не поправил).
            var plastics = [];
            if (Obj.Plastics && Obj.Plastics.Count > 0) {
                for (var pi = 0; pi < Obj.Plastics.Count; pi++) {
                    var pl = Obj.Plastics.Plastics[pi];
                    var pInfo = GetMaterialInfo(pl.Material);
                    plastics.push({
                        Material: pl.Material,
                        Thickness: pl.Thickness,
                        TextureOrientation: pl.TextureOrientation,
                        Side: pl.Side,
                        Category: pInfo.Category,
                        ColorFallback: pInfo.Color
                    });
                }
            }
            Line.Plastics = plastics;
        } catch (e) {
            Line.Plastics = null;
            Line.PlasticsError = e.message;
        }

        try {
            // "\u0440\u043e\u0434\u043d\u043e\u0439" цвет объекта (обводка/каркас) — есть почти всегда,
            // в отличие от Material, который есть только у панелей.
            // Полезно для фурнитуры без материала — своим цветом вместо
            // серого по умолчанию.
            Line.LineColor = Obj.Color;
        } catch (e) {
            Line.LineColor = null;
        }

        try {
            // числовое значение размерной линии (Size3D.Value) —
            // то, что реально написано на выноске
            Line.Value = Obj.Value;
        } catch (e) {
            Line.Value = null;
        }

        try {
            // точки привязки размерной линии — в декларациях фигурируют
            // только как параметры MakeOnPoints(Pos1,Pos2,TopPos), не
            // факт, что читаются обратно как свойства готового объекта;
            // пробуем на всякий случай, безопасно (просто null, если нет)
            Line.Pos1 = Obj.Pos1 ? [R(Obj.Pos1.x), R(Obj.Pos1.y), R(Obj.Pos1.z)] : null;
        } catch (e) {
            Line.Pos1 = null;
        }
        try {
            Line.Pos2 = Obj.Pos2 ? [R(Obj.Pos2.x), R(Obj.Pos2.y), R(Obj.Pos2.z)] : null;
        } catch (e) {
            Line.Pos2 = null;
        }
        try {
            Line.TopPos = Obj.TopPos ? [R(Obj.TopPos.x), R(Obj.TopPos.y), R(Obj.TopPos.z)] : null;
        } catch (e) {
            Line.TopPos = null;
        }

        try {
            // кромка по торцам — PanelButt: ElemIndex (индекс элемента 2D-
            // контура панели) + Material (имя материала кромки строкой).
            // Соответствие ElemIndex ↔ наши торцевые грани (BOX_FACES) ещё
            // не установлено — потребуется сверка на реальном примере.
            var butts = [];
            if (Obj.Butts && Obj.Butts.Count > 0) {
                for (var bi = 0; bi < Obj.Butts.Count; bi++) {
                    var b = Obj.Butts[bi];
                    butts.push({ ElemIndex: b.ElemIndex, Material: b.Material });
                }
            }
            Line.Butts = butts;
        } catch (e) {
            Line.Butts = null;
            Line.ButtsError = e.message;
        }

        try {
            // пазы/фрезеровки — PanelCut: Trajectory (где на панели идёт паз,
            // берём охватывающий прямоугольник Min/Max) + Contour (профиль
            // сечения самого паза, Width/Height = ширина/глубина реза).
            // Полный полигон не берём — для декали-текстуры достаточно
            // прямоугольной оценки, как договорились.
            var cuts = [];
            if (Obj.Cuts && Obj.Cuts.Count > 0) {
                for (var ki = 0; ki < Obj.Cuts.Count; ki++) {
                    var cut = Obj.Cuts.Cuts[ki];
                    var cutData = { Name: cut.Name, Sign: cut.Sign };
                    try {
                        cutData.TrajMin = [R(cut.Trajectory.Min.x), R(cut.Trajectory.Min.y)];
                        cutData.TrajMax = [R(cut.Trajectory.Max.x), R(cut.Trajectory.Max.y)];
                    } catch (e2) {
                        cutData.TrajMin = null;
                        cutData.TrajMax = null;
                    }
                    try {
                        cutData.ProfileWidth = R(cut.Contour.Width);
                        cutData.ProfileHeight = R(cut.Contour.Height);
                    } catch (e3) {
                        cutData.ProfileWidth = null;
                        cutData.ProfileHeight = null;
                    }
                    cuts.push(cutData);
                }
            }
            Line.Cuts = cuts;
        } catch (e) {
            Line.Cuts = null;
            Line.CutsError = e.message;
        }

        try {
            // реальный контур пласти — только если он НЕ простой прямоугольник
            // (IsContourRectangle() — готовый метод, не сравниваем вручную с
            // GMin/GMax). Сейчас поддерживаем только контуры из ОДНИХ прямых
            // (тип "а": скос/срез угла и т.п.) — дуги помечаем как "other",
            // чтобы вьювер знал, что пока не может это обработать, и откатился
            // на прямоугольник, а не строил неверную геометрию.
            if (Obj.Contour && !Obj.Contour.IsContourRectangle()) {
                var segs = [];
                var allLines = true;
                for (var coi = 0; coi < Obj.Contour.Count; coi++) {
                    var el2d = Obj.Contour[coi];
                    if (el2d.IsLine()) {
                        var ln = el2d.AsLine();
                        segs.push({
                            Type: 'line',
                            Pos1: [R(ln.Pos1.x), R(ln.Pos1.y)],
                            Pos2: [R(ln.Pos2.x), R(ln.Pos2.y)]
                        });
                    } else {
                        allLines = false;
                        segs.push({ Type: 'other' });
                    }
                }
                Line.Contour = { AllLines: allLines, Segments: segs };
            } else {
                Line.Contour = null; // обычный прямоугольник — ничего особенного
            }
        } catch (e) {
            Line.Contour = null;
            Line.ContourError = e.message;
        }

        try {
            // цепочка анимации открывания (двери/ящики) — см.
            // CollectAnimationChain выше и docs/animation.md. Пустой массив,
            // если у объекта нет анимируемого владельца — это нормально,
            // не ошибка.
            Line.AnimationChain = CollectAnimationChain(Obj);
        } catch (e) {
            Line.AnimationChain = null;
            Line.AnimationChainError = e.message;
        }

        Doc.Elements.push(Line);
    }
}

function DoExport() {
    Doc = {};
    Doc.Elements = [];

    // Пересчитываем заново, а не берём значение из самого начала скрипта —
    // между запуском скрипта и нажатием "Экспортировать" пользователь
    // мог провзаимодействовать с диалогом материалов, и реальное
    // выделение в Базисе к этому моменту могло измениться/слететь.
    AnySelected = HasSelection(Model);

    // ---- верхний уровень: группировка по блокам + выборочный экспорт ----
    // Если в сцене есть хоть одно выделение — экспортируем только блоки
    // ВЕРХНЕГО уровня, где есть хоть один выделенный потомок. Если этот
    // блок выделен ЦЕЛИКОМ САМ (ForceInclude) — дальше внутри него уже
    // ничего не фильтруется (см. ProcessObject — листовые детали внутри
    // выделенного блока обычно не помечены .Selected по отдельности).
    for (var i = 0; i < Model.Count; i++) {
        var TopObj = Model[i];
        var IsBlock = !!TopObj.List;
        var GroupName = IsBlock ? TopObj.Name : null; // "бесхозный" объект вне блока — Group=null

        if (AnySelected && !HasSelection(TopObj)) continue; // выборочный режим — пропускаем непричастные блоки

        var TopSelfSelected = false;
        try { TopSelfSelected = !!TopObj.Selected; } catch (eTop) {}
        ProcessObject(TopObj, GroupName, TopSelfSelected);
    }

    var text = JSON.stringify(Doc);
    system.askWriteTextFile('json', text);

    alert('\u041c\u043e\u0434\u0435\u043b\u044c \u044d\u043a\u0441\u043f\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e.\n\n\u041d\u0435 \u0437\u0430\u0431\u0443\u0434\u044c\u0442\u0435 \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e \u0441\u0434\u0435\u043b\u0430\u0442\u044c \u044d\u043a\u0441\u043f\u043e\u0440\u0442 \u0447\u0435\u0440\u0435\u0437 \u0411\u0430\u0437\u0438\u0441: \u0424\u0430\u0439\u043b \u2192 \u042d\u043a\u0441\u043f\u043e\u0440\u0442 \u2192 \u0444\u043e\u0440\u043c\u0430\u0442 Collada (.dae).');
}
