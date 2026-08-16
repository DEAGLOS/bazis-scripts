// ============================================================
// Диагностика v2 — то же, что v1, плюс:
// - общий перебор свойств объекта через for...in (может вытащить
//   поля, которые мы не угадали явным списком);
// - отдельные явные попытки для Color/LineColor/Material/Contour/
//   Cuts/Butts/Plastics (по аналогии с полями JSON-экспортёра
//   вьювера) — уже НАПРЯМУЮ на объекте, без AsPanel() (раз AsPanel
//   недоступен, возможно у этого типа такие поля не через "приведение",
//   а сразу как свойства);
// - проверка, какие МЕТОДЫ вообще есть у объекта (typeof === function)
//   — чтобы понять, насколько урезан его API по сравнению с обычным
//   Object3.
// Ничего не создаёт и не меняет в модели.
// ============================================================

var OUT = [];
function Log(s) { OUT.push(s); }

function Safe(fn, label) {
    try {
        var v = fn();
        Log(label + ' = ' + JSON.stringify(v));
        return v;
    } catch (e) {
        Log(label + ' -> (недоступно: ' + e.message + ')');
        return undefined;
    }
}

function DumpVector(v) {
    if (v === undefined || v === null) return 'null';
    try { return '(' + v.x.toFixed(2) + ', ' + v.y.toFixed(2) + ', ' + v.z.toFixed(2) + ')'; }
    catch (e) { return String(v); }
}

function DumpExtra(Obj, Pad) {
    Log(Pad + '--- доп. попытки (Color/Material/Contour и т.п. напрямую) ---');
    Safe(function(){ return Obj.Color; }, Pad + 'Color');
    Safe(function(){ return Obj.LineColor; }, Pad + 'LineColor');
    Safe(function(){ return Obj.Material; }, Pad + 'Material (сам объект)');
    Safe(function(){ return Obj.Material.MaterialName; }, Pad + 'Material.MaterialName');
    Safe(function(){ return Obj.Material.DiffuseColor; }, Pad + 'Material.DiffuseColor');
    Safe(function(){ return Obj.Contour; }, Pad + 'Contour (напрямую)');
    Safe(function(){ return Obj.Contour.Count; }, Pad + 'Contour.Count');
    Safe(function(){ return Obj.Cuts; }, Pad + 'Cuts');
    Safe(function(){ return Obj.Butts; }, Pad + 'Butts');
    Safe(function(){ return Obj.Plastics; }, Pad + 'Plastics');
    Safe(function(){ return Obj.Width; }, Pad + 'Width');
    Safe(function(){ return Obj.Height; }, Pad + 'Height');

    Log(Pad + '--- какие методы вообще есть (typeof === function) ---');
    var Candidates = ['AsPanel','AsList','ToGlobal','ToObject','NToGlobal','NToObject',
        'Translate','TranslateGCS','Rotate','RotateX','RotateY','RotateZ',
        'Orient','OrientGCS','SetDefaultTransform','Build'];
    for (var ci = 0; ci < Candidates.length; ci++) {
        var Name = Candidates[ci];
        try {
            Log(Pad + '  ' + Name + ': ' + (typeof Obj[Name]));
        } catch (eM) {
            Log(Pad + '  ' + Name + ': (ошибка доступа: ' + eM.message + ')');
        }
    }

    Log(Pad + '--- for...in перебор всех перечисляемых свойств ---');
    var Any = false;
    for (var key in Obj) {
        Any = true;
        try {
            var val = Obj[key];
            var t = typeof val;
            if (t === 'function') {
                Log(Pad + '  [for-in] ' + key + '()');
            } else {
                Log(Pad + '  [for-in] ' + key + ' (' + t + ') = ' + String(val));
            }
        } catch (eEnum) {
            Log(Pad + '  [for-in] ' + key + ' -> ошибка: ' + eEnum.message);
        }
    }
    if (!Any) Log(Pad + '  (for...in ничего не дал — объект не отдаёт перечисляемые свойства)');

    Safe(function(){ return Obj.constructor.name; }, Pad + 'constructor.name');
    Safe(function(){ return Object.getPrototypeOf(Obj); }, Pad + 'getPrototypeOf(Obj)');
}

function DumpObject(Obj, Indent) {
    var Pad = '';
    for (var pi = 0; pi < Indent; pi++) Pad += '  ';

    Log(Pad + '--- Объект ---');
    Safe(function(){ return Obj.Name; }, Pad + 'Name');
    Safe(function(){ return Obj.List; }, Pad + 'List (контейнер?)');
    Safe(function(){ return DumpVector(Obj.GSize); }, Pad + 'GSize');
    Safe(function(){ return Obj.MaterialName; }, Pad + 'MaterialName');
    Safe(function(){ return Obj.Owner ? Obj.Owner.Name : null; }, Pad + 'Owner.Name');

    DumpExtra(Obj, Pad);
}

function FindByNameRec(Obj, NameLower, Results) {
    try {
        if (String(Obj.Name).toLowerCase().indexOf(NameLower) >= 0) Results.push(Obj);
    } catch (e1) {}
    try {
        if (Obj.List) {
            var L = Obj.AsList();
            for (var i = 0; i < L.Count; i++) FindByNameRec(L[i], NameLower, Results);
        }
    } catch (e2) {}
}

try {
    var Found = [];
    for (var mi = 0; mi < Model.Count; mi++) FindByNameRec(Model[mi], 'габаритная рамка', Found);

    if (!Found.length) {
        Log('НИЧЕГО НЕ НАЙДЕНО по имени "габаритная рамка".');
    } else {
        Log('Найдено: ' + Found.length);
        for (var fi = 0; fi < Found.length; fi++) DumpObject(Found[fi], 0);
    }

    system.askWriteTextFile('txt', OUT.join('\n'));

} catch (eTop) {
    alert('Ошибка диагностики v2: ' + eTop.message);
}
