// ============================================================
// Габаритная рамка по ВЫДЕЛЕНИЮ (настоящий нативный объект) — находит
// уже существующий в проекте объект "Габаритная рамка" (class
// TModelLimits — он есть ОДИН на любой проект Базиса, изначально
// спящий с Active=false) и ПЕРЕНАСТРАИВАЕТ его размер + позицию под
// мировой габарит ТЕКУЩЕГО ВЫДЕЛЕНИЯ, включает Active.
//
// Ничего не выделено -> скрипт останавливается с alert, НЕ откатывается
// на габарит всей модели (было в предыдущей версии, убрано по факту
// найденной живым тестом ошибки — см. ниже).
//
// ПОЧЕМУ НЕ "ПО МОДЕЛИ ЦЕЛИКОМ": предыдущая версия считала габарит по
// Model.GMin/GMax (вся модель) — оказалось, что это включает ВООБЩЕ
// ВСЕ объекты верхнего уровня, даже СКРЫТЫЕ (невидимые в 3D-виде).
// Живой тест: в проекте был отдельный верхнеуровневый объект "Слой1" со
// стенами помещения, пользователь скрыл его видимость — но габарит всё
// равно считался с учётом стен (габарит 4882x3323x1725мм вместо
// габарита реальной мебели). Диагностика — см.
// Диагностика_Габарит_Модели.js в этой же папке. Вывод: видимость
// объекта НЕ влияет на Model.GMin/GMax, полагаться на "всю модель"
// нельзя, если в проекте могут быть посторонние верхнеуровневые блоки
// (стены/слои/т.п.). Выделение — надёжнее, т.к. его выбирает сам
// пользователь осознанно.
//
// ВНИМАНИЕ, ЭТО СИНГЛТОН НА ВЕСЬ ПРОЕКТ: если границы помещения уже
// были настроены (реальная задача этого объекта — Г-образные комнаты
// и т.п., см. LCornerAngle/LDistance), этот скрипт их ЗАТРЁТ размером
// выделения. Если нужен независимый безопасный вариант, не трогающий
// этот объект — смотри Габаритный_блок.js / Габаритная_рамка.js (свой
// Extrusion).
//
// Undo: Undo.Changing(Obj) вызывается ОДИН раз перед всей группой
// присвоений (приём из примера "Правка имён панелей.js" от Игоря
// Кизюна) — так Ctrl+Z откатывает всё разом одним шагом.
//
// ПОДТВЕРЖДЕНО вживую пользователем: Width/Height/Depth/PositionX/Y/Z/
// Active — записываемы. Обёрнуто в try/catch на каждое присвоение —
// если какое-то не сработает, вылезет в тексте ошибки, но остальные
// всё равно применятся.
//
// Порядок координат — по наблюдению на реальном объекте (GMin всегда
// (0,0,0) в его локальной СК, GMax = GSize): его локальное начало
// координат — это МИН-угол коробки, как и у наших Extrusion-версий.
// Поэтому Position = мировой мин-угол выделения, а не центр.
// ============================================================

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
        alert('Объект "Габаритная рамка" не найден в проекте. Проверьте, что он есть штатно (виден на дереве модели) в вашей версии Базиса.');
    } else if (Model.SelectionCount === 0) {
        alert('Ничего не выделено. Выделите объект(ы), под габарит которых нужно перенастроить рамку, и запустите скрипт снова.');
    } else {

        var Obj = Found[0];
        var WasActive = false;
        try { WasActive = Obj.Active; } catch (eWasActive) {}

        // ---- габарит ТЕКУЩЕГО ВЫДЕЛЕНИЯ ----
        var MinX, MinY, MinZ, MaxX, MaxY, MaxZ;
        var SelCount = 0;
        for (var si = 0; si < Model.SelectionCount; si++) {
            var Sel = Model.Selections[si];
            if (Sel === Obj) continue; // сама рамка не должна попасть в свой же расчёт
            var GMn = Sel.GabMin;
            var GMx = Sel.GabMax;
            SelCount++;
            if (MinX === undefined) {
                MinX = GMn.x; MinY = GMn.y; MinZ = GMn.z;
                MaxX = GMx.x; MaxY = GMx.y; MaxZ = GMx.z;
            } else {
                if (GMn.x < MinX) MinX = GMn.x;
                if (GMn.y < MinY) MinY = GMn.y;
                if (GMn.z < MinZ) MinZ = GMn.z;
                if (GMx.x > MaxX) MaxX = GMx.x;
                if (GMx.y > MaxY) MaxY = GMx.y;
                if (GMx.z > MaxZ) MaxZ = GMx.z;
            }
        }

        if (!SelCount) {
            alert('В выделении только сама "Габаритная рамка" — выделите что-то ещё.');
        } else {

            var W = MaxX - MinX;
            var H = MaxY - MinY;
            var D = MaxZ - MinZ;

            if (W <= 0 || H <= 0 || D <= 0) {
                alert('Не удалось определить габарит выделения (вырожденный размер). Скрипт остановлен.');
            } else {

                var Errors = [];
                function TrySet(fn, label) {
                    try { fn(); } catch (e) { Errors.push(label + ': ' + e.message); }
                }

                // Регистрируем объект в истории ДО правок — иначе Ctrl+Z не
                // откатывает изменения одним шагом.
                try { Undo.Changing(Obj); } catch (eUndo) { Errors.push('Undo.Changing: ' + eUndo.message); }

                TrySet(function(){ Obj.Width = W; }, 'Width');
                TrySet(function(){ Obj.Height = H; }, 'Height');
                TrySet(function(){ Obj.Depth = D; }, 'Depth');
                TrySet(function(){ Obj.PositionX = MinX; }, 'PositionX');
                TrySet(function(){ Obj.PositionY = MinY; }, 'PositionY');
                TrySet(function(){ Obj.PositionZ = MinZ; }, 'PositionZ');
                TrySet(function(){ Obj.Active = true; }, 'Active');
                TrySet(function(){ Obj.Build(); }, 'Build');

                // Успешный прогон — молча, без alert (по просьбе
                // пользователя). Если какое-то присвоение не сработало,
                // это всё равно всплывёт: см. Errors ниже.
                if (Errors.length) {
                    alert('Рамка перенастроена, но часть свойств не удалось применить:\n' + Errors.join('\n'));
                }
            }
        }
    }

} catch (eTop) {
    alert('Ошибка: ' + eTop.message);
}
