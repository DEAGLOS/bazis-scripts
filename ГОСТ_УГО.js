// ============================================================
// ГОСТ УГО — замена выделенного объекта(ов) на условное графическое
// обозначение (УГО) из списка. Список задаётся ОТДЕЛЬНЫМ файлом-
// манифестом ГОСТ_УГО_список.json (лежит рядом со скриптом) —
// чтобы добавлять новые обозначения без правки самого скрипта.
//
// Манифест — JSON-массив вида:
// [ {"name":"Розетка одноместная", "file":"Розетка_1.f3d", "preview":"Розетка_1.png"},
//   {"name":"Выключатель",         "file":"Выключатель.f3d"} ]
// "preview" необязателен (превью тогда не показывается).
//
// ВАЖНО (не проверено вживую, требует реального теста в Базисе):
// - показ картинки-превью в новом окне (UI.components) — точное имя
//   свойства для назначения изображения на кнопке не подтверждено,
//   обёрнуто в try/catch с тихим откатом на просто текст;
// - Mount1 требует ЛЮБУЮ панель как формального "владельца" нового
//   объекта в дереве модели — реальные положение/поворот берутся не
//   из её параметров, а копируются напрямую со старого объекта сразу
//   после (через PositionX/Y/Z + OrientGCS), поэтому какая именно
//   панель используется как якорь — не важно для итоговой геометрии.
// ============================================================

var MANIFEST_FILE = 'ГОСТ_УГО_список.json';

function VectorSub(a, b) {
    return NewVector(a.x - b.x, a.y - b.y, a.z - b.z);
}

// Ищем в модели ЛЮБУЮ панель — чисто формальный "якорь" для Mount1,
// на итоговую геометрию не влияет (см. комментарий выше).
//
// AsPanel() ПОДТВЕРЖДЕНО НЕ существует в этой версии Базиса ("Obj.
// AsPanel is not a function" даже на обычной панели "Боковина",
// см. Эксперимент_Кромка_Материал.js) — types.js устарел. Проверяем
// "это панель?" через доступность поля Butts (панель-специфичное)
// напрямую, без приведения — сам Obj и есть панель, если это прошло.
function FindPanelRec(Obj) {
    try {
        var ProbeButts = Obj.Butts; // бросит исключение, если не панель
        if (ProbeButts !== undefined) return Obj;
    } catch (eNotPanel) {}
    try {
        if (Obj.List) {
            var L = Obj.AsList();
            for (var i = 0; i < L.Count; i++) {
                var Found = FindPanelRec(L[i]);
                if (Found) return Found;
            }
        }
    } catch (eList) {}
    return null;
}
function FindAnyPanel() {
    for (var i = 0; i < Model.Count; i++) {
        var Found = FindPanelRec(Model[i]);
        if (Found) return Found;
    }
    return null;
}

// Заменяет один объект: запоминает мировые положение/ориентацию,
// удаляет старый, ставит новую фурнитуру и переносит на неё то же
// самое положение/ориентацию.
function ReplaceObject(OldObj, SymbolFile, AnchorPanel) {
    var Zero  = NewVector(0, 0, 0);
    var UnitZ = NewVector(0, 0, 1);
    var UnitY = NewVector(0, 1, 0);

    // ОБЯЗАТЕЛЬНО через NewVector-обёртку — без неё ToGlobal не делает
    // трансформацию по-настоящему (известный баг движка, см. docs).
    var GPos   = OldObj.ToGlobal(Zero);
    var GAxisZ = VectorSub(OldObj.ToGlobal(UnitZ), GPos);
    var GAxisY = VectorSub(OldObj.ToGlobal(UnitY), GPos);

    DeleteObject(OldObj);

    var Furn = OpenFurniture(SymbolFile);
    var NewObj = Furn.Mount1(AnchorPanel, 0, 0, 0, 0);

    NewObj.PositionX = GPos.x;
    NewObj.PositionY = GPos.y;
    NewObj.PositionZ = GPos.z;
    NewObj.OrientGCS(GAxisZ, GAxisY);

    return NewObj;
}

function ReplaceSelected(Symbols, ItemIndex, SelectedObjects) {
    var AnchorPanel = FindAnyPanel();
    if (!AnchorPanel) {
        alert('В модели нет ни одной панели — не на что формально подвесить новый объект. Добавьте хотя бы одну панель в проект.');
        return;
    }
    var SymbolFile = Symbols[ItemIndex].file;
    var Replaced = 0;
    var Errors = [];
    for (var i = 0; i < SelectedObjects.length; i++) {
        try {
            ReplaceObject(SelectedObjects[i], SymbolFile, AnchorPanel);
            Replaced++;
        } catch (eRepl) {
            var NameForError = '?';
            try { NameForError = SelectedObjects[i].Name; } catch (eName) {}
            Errors.push(NameForError + ': ' + eRepl.message);
        }
    }
    try { Action.Commit(); } catch (eCommit) {}

    var Msg = 'Заменено объектов: ' + Replaced + ' из ' + SelectedObjects.length + '.';
    if (Errors.length) {
        Msg += '\nОшибки (' + Errors.length + '):\n' + Errors.slice(0, 8).join('\n');
        if (Errors.length > 8) Msg += '\n…';
    }
    alert(Msg);
}

// ============================================================
// Шаг 1 — читаем манифест обозначений
// ============================================================
var Symbols = [];
try {
    if (system.fileExists(MANIFEST_FILE)) {
        Symbols = JSON.parse(system.readTextFile(MANIFEST_FILE));
    }
} catch (eManifest) {
    alert('Не удалось прочитать список обозначений (' + MANIFEST_FILE + '): ' + eManifest.message);
}

if (!Symbols || !Symbols.length) {
    alert('Список обозначений пуст. Проверьте файл ' + MANIFEST_FILE + ' рядом со скриптом — он должен быть JSON-массивом с полями name/file.');
} else {

    // ============================================================
    // Шаг 2 — выделение СНИМАЕМ ДО открытия окна (открытие окна может
    // сбить фокус/выделение в 3D-виде)
    // ============================================================
    var SelectedObjects = [];
    for (var si = 0; si < Model.SelectionCount; si++) SelectedObjects.push(Model.Selections[si]);

    if (!SelectedObjects.length) {
        alert('Сначала выделите один или несколько объектов для замены, затем запустите скрипт.');
    } else {

        // ============================================================
        // Шаг 3 — окно. UI.components.NewForm() — не на всех версиях
        // Базиса (подтверждено: недоступно минимум на Базис 2022) —
        // проверяем и откатываемся на докнутую панель Action.Properties.
        // ============================================================
        var USING_NEW_UI = (typeof UI !== 'undefined' && UI.components && typeof UI.components.NewForm === 'function');

        if (USING_NEW_UI) {
            var Form = UI.components.NewForm();
            Form.Caption = 'ГОСТ УГО — замена обозначения';
            Form.Width = 420;
            Form.Height = 260;
            Form.ShowHint = true;

            var InfoLbl = UI.components.NewLabel(Form, Form);
            InfoLbl.Caption = 'Выделено объектов: ' + SelectedObjects.length;
            InfoLbl.Left = 10; InfoLbl.Top = 10; InfoLbl.Width = 400; InfoLbl.Height = 16;

            var TypeLbl = UI.components.NewLabel(Form, Form);
            TypeLbl.Caption = 'Тип обозначения:';
            TypeLbl.Left = 10; TypeLbl.Top = 36; TypeLbl.Width = 150; TypeLbl.Height = 16;

            var Combo = UI.components.NewComboBox(Form, Form);
            with (Combo.Properties.Items) {
                for (var ci = 0; ci < Symbols.length; ci++) Add(Symbols[ci].name);
            }
            Combo.ItemIndex = 0;
            Combo.Left = 10; Combo.Top = 54; Combo.Width = 240; Combo.Height = 23;

            // Превью справа — точное имя свойства для картинки не
            // подтверждено, пробуем несколько вариантов, тихо откатываясь
            // на просто подпись с именем файла, если ни один не сработал.
            var PreviewImg = UI.components.NewImageButton(Form, Form);
            PreviewImg.Enabled = false;
            PreviewImg.Left = 260; PreviewImg.Top = 54; PreviewImg.Width = 150; PreviewImg.Height = 150;

            var PreviewLbl = UI.components.NewLabel(Form, Form);
            PreviewLbl.Left = 260; PreviewLbl.Top = 208; PreviewLbl.Width = 150; PreviewLbl.Height = 16;

            function UpdatePreview() {
                var Sym = Symbols[Combo.ItemIndex];
                PreviewImg.Caption = Sym.name;
                if (Sym.preview) {
                    try { PreviewImg.Glyph = Sym.preview; } catch (e1) {
                        try { PreviewImg.Picture = Sym.preview; } catch (e2) {
                            try { PreviewImg.Image = Sym.preview; } catch (e3) {}
                        }
                    }
                }
                PreviewLbl.Caption = Sym.file;
            }
            Combo.OnChange = UpdatePreview;
            UpdatePreview();

            var ApplyBtn = UI.components.NewImageButton(Form, Form);
            ApplyBtn.Caption = 'Применить к выделенному';
            ApplyBtn.Left = 10; ApplyBtn.Top = 90; ApplyBtn.Width = 240; ApplyBtn.Height = 28;
            ApplyBtn.OnClick = function() {
                ReplaceSelected(Symbols, Combo.ItemIndex, SelectedObjects);
                Form.Close();
            };

            var CloseBtn = UI.components.NewImageButton(Form, Form);
            CloseBtn.Caption = 'Закрыть';
            CloseBtn.Left = 10; CloseBtn.Top = 124; CloseBtn.Width = 240; CloseBtn.Height = 28;
            CloseBtn.OnClick = function() {
                Form.Close();
            };

            Form.OnClose = function() {
                Action.Finish();
            };

            Form.Show();

        } else {
            // ---- запасной путь: докнутая панель Action.Properties ----
            var Prop = Action.Properties;

            var ItemsStr = '';
            for (var pi = 0; pi < Symbols.length; pi++) {
                ItemsStr += (pi ? '\n' : '') + Symbols[pi].name;
            }
            var ComboLegacy = Prop.NewCombo('Тип обозначения', ItemsStr);
            ComboLegacy.ItemIndex = 0;

            var PreviewGrp = Prop.NewImage('Превью', Symbols[0].preview || '');

            ComboLegacy.OnChange = function() {
                var Sym = Symbols[ComboLegacy.ItemIndex];
                try { PreviewGrp.Image = Sym.preview || ''; } catch (eImg) {}
            };

            var ApplyBtnLegacy = Prop.NewButton('Применить к выделенному');
            ApplyBtnLegacy.OnClick = function() {
                ReplaceSelected(Symbols, ComboLegacy.ItemIndex, SelectedObjects);
                Action.Commit();
                Action.Finish();
            };

            var CloseBtnLegacy = Prop.NewButton('Закрыть');
            CloseBtnLegacy.OnClick = function() {
                Action.Finish();
            };

            Action.Continue();
        }
    }
}
