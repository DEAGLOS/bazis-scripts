// ============================================================
// ƒиагностика габарита модели Ч по каждому объекту ¬≈–’Ќ≈√ќ ”–ќ¬Ќя
// Model печатает Name + мировой габарит (GabMin/GabMax) + размер по
// ос€м. Ќичего не создаЄт и не мен€ет в модели, только читает.
//
// «ачем: "√абаритна€_рамка_TModelLimits.js" (верси€ "по модели
// целиком") посчитала габарит 4882 x 3323.2 x 1725 мм Ч заметно
// больше, чем видима€ на скриншоте мебель. √ипотеза: Model.GMin/GMax
// включает в габарит Ќ≈ “ќЋ№ ќ мебель, а вообще все объекты проекта
// (возможно Ч стены/пол/потолок помещени€, размерные линии или другой
// служебный объект). Ётот скрипт не чинит рамку, а просто показывает
// габарит  ј∆ƒќ√ќ объекта верхнего уровн€ по отдельности, чтобы
// глазами найти, какой из них раздувает общий габарит модели.
//
// GabMin/GabMax, а не GMin/GMax: по index.d.ts у Object3 GMin/GMax Ч
// габарит ¬ Ћ—  (локальный), а GabMin/GabMax Ч мировой габарит объекта.
// ƒл€ верхнеуровневых объектов нужен именно мировой.
//
// ќбъекты с габаритом больше LARGE_THRESHOLD хот€ бы по одной оси
// помечаютс€ "[!]" в начале строки Ч чтобы не листать глазами весь
// список в поисках виновника.
// ============================================================

var LARGE_THRESHOLD = 2000; // мм Ч выше этого считаем "подозрительно большим"

var OUT = [];
function Log(s) { OUT.push(s); }

function DumpVector(v) {
    if (v === undefined || v === null) return 'null';
    try { return '(' + v.x.toFixed(1) + ', ' + v.y.toFixed(1) + ', ' + v.z.toFixed(1) + ')'; }
    catch (e) { return String(v); }
}

try {

    Log('¬сего объектов верхнего уровн€ в Model: ' + Model.Count);
    Log('');

    for (var i = 0; i < Model.Count; i++) {
        var Obj = Model[i];

        var Name = '(нет имени)';
        try { Name = String(Obj.Name); } catch (eName) { Name = '(ошибка чтени€ Name: ' + eName.message + ')'; }

        var Line;
        try {
            var GMn = Obj.GabMin;
            var GMx = Obj.GabMax;
            var W = GMx.x - GMn.x;
            var H = GMx.y - GMn.y;
            var D = GMx.z - GMn.z;
            var IsLarge = (Math.abs(W) > LARGE_THRESHOLD || Math.abs(H) > LARGE_THRESHOLD || Math.abs(D) > LARGE_THRESHOLD);
            Line = (IsLarge ? '[!] ' : '    ') + i + '. ' + Name +
                '  размер=' + W.toFixed(1) + ' x ' + H.toFixed(1) + ' x ' + D.toFixed(1) +
                '  min=' + DumpVector(GMn) + '  max=' + DumpVector(GMx);
        } catch (eGab) {
            Line = '    ' + i + '. ' + Name + '  -> GabMin/GabMax недоступны: ' + eGab.message;
        }

        Log(Line);
    }

    alert(OUT.join('\n'));

} catch (eTop) {
    alert('ќшибка: ' + eTop.message);
}
