// ============================================================
// Диагностика объекта "габаритная рамка" — ищет по всей модели объект
// с таким именем (без учёта регистра) и выгружает в текстовый файл
// ВСЁ, что можно о нём прочитать: тип, состав (если это контейнер),
// габариты, позицию и т.п. Ничего не создаёт и не меняет в модели.
//
// Каждое поле читается в try/catch — если объект не поддерживает
// свойство, движок Базиса бросает исключение (не возвращает undefined
// тихо), это нормально и просто пропускается.
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

function DumpObject(Obj, Indent) {
    var Pad = '';
    for (var pi = 0; pi < Indent; pi++) Pad += '  ';

    Log(Pad + '--- Объект ---');
    Safe(function(){ return Obj.Name; }, Pad + 'Name');
    Safe(function(){ return Obj.ArtPos; }, Pad + 'ArtPos');
    Safe(function(){ return Obj.List; }, Pad + 'List (контейнер?)');
    Safe(function(){ return Obj.Visible; }, Pad + 'Visible');
    Safe(function(){ return Obj.Selected; }, Pad + 'Selected');

    var GS = Safe(function(){ return DumpVector(Obj.GSize); }, Pad + 'GSize');
    Safe(function(){ return DumpVector(Obj.GMin); }, Pad + 'GMin (ЛСК)');
    Safe(function(){ return DumpVector(Obj.GMax); }, Pad + 'GMax (ЛСК)');
    Safe(function(){ return DumpVector(Obj.GabMin); }, Pad + 'GabMin (мировой)');
    Safe(function(){ return DumpVector(Obj.GabMax); }, Pad + 'GabMax (мировой)');

    Safe(function(){ return Obj.PositionX; }, Pad + 'PositionX');
    Safe(function(){ return Obj.PositionY; }, Pad + 'PositionY');
    Safe(function(){ return Obj.PositionZ; }, Pad + 'PositionZ');

    // Пробуем распознать конкретный тип разными способами
    Safe(function(){ var P = Obj.AsPanel(); return !!P; }, Pad + 'AsPanel() успешен');
    try {
        var Panel = Obj.AsPanel();
        if (Panel) {
            Safe(function(){ return Panel.Thickness; }, Pad + '  Panel.Thickness');
            Safe(function(){ return Panel.MaterialName; }, Pad + '  Panel.MaterialName');
            Safe(function(){ return Panel.Contour.Count; }, Pad + '  Panel.Contour.Count (сегментов)');
        }
    } catch (ePanel) { Log(Pad + '  (AsPanel деталей: ' + ePanel.message + ')'); }

    Safe(function(){ return Obj.IsFastener; }, Pad + 'IsFastener (признак Block)');
    Safe(function(){ return Obj.AnimType; }, Pad + 'AnimType (признак Block/Assembly)');
    Safe(function(){ return Obj.MaterialName; }, Pad + 'MaterialName (если Extrusion)');
    Safe(function(){ return Obj.Thickness; }, Pad + 'Thickness (если Extrusion)');

    try {
        var OwnerName = Obj.Owner ? Obj.Owner.Name : '(нет владельца)';
        Log(Pad + 'Owner.Name = ' + JSON.stringify(OwnerName));
    } catch (eOwner) { Log(Pad + 'Owner -> (недоступно: ' + eOwner.message + ')'); }

    // Если это контейнер — рекурсивно спускаемся в детей
    try {
        if (Obj.List) {
            var L = Obj.AsList();
            Log(Pad + 'Дочерних объектов: ' + L.Count);
            for (var i = 0; i < L.Count; i++) {
                DumpObject(L[i], Indent + 1);
            }
        }
    } catch (eChildren) {
        Log(Pad + '(не удалось обойти детей: ' + eChildren.message + ')');
    }
}

function FindByNameRec(Obj, NameLower, Results) {
    try {
        if (String(Obj.Name).toLowerCase().indexOf(NameLower) >= 0) {
            Results.push(Obj);
        }
    } catch (e1) {}
    try {
        if (Obj.List) {
            var L = Obj.AsList();
            for (var i = 0; i < L.Count; i++) FindByNameRec(L[i], NameLower, Results);
        }
    } catch (e2) {}
}

try {
    Log('=== Поиск объектов с именем, содержащим "габаритная рамка" ===');
    Log('Всего объектов верхнего уровня в модели: ' + Model.Count);

    var Found = [];
    for (var mi = 0; mi < Model.Count; mi++) {
        FindByNameRec(Model[mi], 'габаритная рамка', Found);
    }

    if (!Found.length) {
        Log('НИЧЕГО НЕ НАЙДЕНО по имени "габаритная рамка".');
        Log('Возможные причины: другое точное название, либо объект');
        Log('не входит в обычное дерево Model (генерируется движком отдельно).');
        Log('');
        Log('=== Полный верхнеуровневый список объектов модели (для сверки имён) ===');
        for (var mi2 = 0; mi2 < Model.Count; mi2++) {
            DumpObject(Model[mi2], 0);
        }
    } else {
        Log('Найдено: ' + Found.length);
        for (var fi = 0; fi < Found.length; fi++) {
            DumpObject(Found[fi], 0);
        }
    }

    system.askWriteTextFile('txt', OUT.join('\n'));

} catch (eTop) {
    alert('Ошибка диагностики: ' + eTop.message);
}
