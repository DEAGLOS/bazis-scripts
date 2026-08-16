// ============================================================
// ЭКСПЕРИМЕНТ (не рабочий инструмент) — проверяем: можно ли скриптом
// назначить на кромку МАТЕРИАЛ, который в Базисе создан/классифицирован
// как "панельный" (листовой), а не как "кромочный" — то, что через
// обычный интерфейс Базиса, по словам пользователя, сделать нельзя.
//
// В API: Panel.Butts.Butts[i].Material — это просто СТРОКА (имя
// материала), а Panel.AddButt(material, elem) принимает имя материала
// как обычный параметр — по сигнатуре никакой проверки "это точно
// кромочный материал" не видно. Вопрос — есть ли такая проверка
// СКРЫТО, внутри движка, при попытке записи/рендера.
//
// !!! ЗАПУСКАТЬ НА ТЕСТОВОЙ/НЕНУЖНОЙ ПАНЕЛИ, НЕ НА РЕАЛЬНОМ ПРОЕКТЕ !!!
// Скрипт меняет данные кромки у выделенной панели. Если что-то пойдёт
// не так — Ctrl+Z в Базисе должен откатить (не проверено вживую).
//
// Выдели ОДНУ панель (у которой уже есть материал, Panel.MaterialName)
// перед запуском.
// ============================================================

try {
    if (Model.SelectionCount < 1) {
        alert('Сначала выделите одну панель (с уже назначенным материалом) и запустите скрипт снова.');
    } else {

        var Obj = Model.Selections[0];

        // AsPanel() ПОДТВЕРЖДЕНО НЕ существует в этой версии Базиса
        // ("Obj.AsPanel is not a function" даже на обычной панели
        // "Боковина") — типы.js врёт, обращаемся к полям панели
        // (Butts/MaterialName/AddButt) НАПРЯМУЮ на объекте, без
        // приведения. Panel — это просто сам Obj.
        var Panel = Obj;

        var IsContainer = false;
        try { IsContainer = Obj.List; } catch (eList) {}

        var HasButts = false;
        var ButtsError = null;
        if (!IsContainer) {
            try {
                var ProbeButts = Obj.Butts; // бросит исключение, если это не панель
                HasButts = (ProbeButts !== undefined);
            } catch (eProbe) {
                ButtsError = eProbe.message;
            }
        }

        if (IsContainer) {
            var ChildCount = '?';
            try { ChildCount = Obj.AsList().Count; } catch (eCnt) {}
            alert('Выделен КОНТЕЙНЕР "' + Obj.Name + '" (блок/сборка), а не отдельная панель — детей внутри: ' + ChildCount + '.\n' +
                  'В Базисе клик в 3D часто выделяет весь блок целиком. Нужно выделить именно панель ' +
                  'внутри него (обычно ещё раз кликнуть по той же детали, чтобы "провалиться" на уровень глубже, ' +
                  'либо выбрать панель в дереве модели), затем запустить скрипт заново.');
        } else if (!HasButts) {
            alert('Выделенный объект "' + (function(){ try { return Obj.Name; } catch(e){ return '?'; } })() +
                  '" — у него нет поля Butts (не панель).\nТочная ошибка: ' + (ButtsError || '(нет текста ошибки)') +
                  '\nВозможно, это фурнитура, Extrusion и т.п. — нужна именно панель.');
        } else {

            var SheetMaterial = null;
            try { SheetMaterial = Panel.MaterialName; } catch (eMat) {}

            if (!SheetMaterial) {
                alert('У выделенной панели не удалось прочитать MaterialName (панельный материал) — нечем тестировать.');
            } else {

                var Report = [];
                Report.push('Панельный материал для теста: "' + SheetMaterial + '"');

                // ---- Попытка 1: AddButt с панельным материалом на
                // элемент 0 (индекс стороны — см. заметку про ElemIndex,
                // здесь не важно КАКАЯ это сторона, важно, пройдёт ли
                // вообще присвоение) ----
                try {
                    var NewButt = Panel.AddButt(SheetMaterial, 0);
                    Report.push('AddButt(панельный материал, 0): УСПЕХ, без ошибки.');
                    try {
                        Report.push('  -> получившийся Butt.Material = "' + NewButt.Material + '"');
                    } catch (eRead) {
                        Report.push('  -> не удалось прочитать Material обратно: ' + eRead.message);
                    }
                } catch (eAdd) {
                    Report.push('AddButt(панельный материал, 0): ОШИБКА — ' + eAdd.message);
                }

                // ---- Попытка 2: если уже есть хоть одна кромка —
                // напрямую подменить её Material (это ближе к слову
                // "заменить" из вопроса) ----
                try {
                    var ButtsList = Panel.Butts;
                    if (ButtsList.Count > 0) {
                        var FirstButt = ButtsList.Butts[0];
                        var OldMaterial = FirstButt.Material;
                        Report.push('Существующая кромка [0], было Material = "' + OldMaterial + '"');
                        try {
                            FirstButt.Material = SheetMaterial;
                            Report.push('  -> присвоение FirstButt.Material = панельный материал: УСПЕХ, без ошибки.');
                            Report.push('  -> сейчас Material = "' + FirstButt.Material + '"');
                        } catch (eSet) {
                            Report.push('  -> присвоение FirstButt.Material: ОШИБКА — ' + eSet.message);
                        }
                    } else {
                        Report.push('У панели пока нет ни одной существующей кромки (Butts.Count = 0) — вторую попытку (замена существующей) пропускаем, смотрите только на AddButt выше.');
                    }
                } catch (eButts) {
                    Report.push('Не удалось прочитать Panel.Butts: ' + eButts.message);
                }

                try { Panel.Build(); } catch (eBuild) { Report.push('Panel.Build() после изменений: ОШИБКА — ' + eBuild.message); }

                Report.push('');
                Report.push('Теперь посмотрите на панель в 3D-виде и в свойствах кромки в интерфейсе Базиса:');
                Report.push('- кромка вообще отрисовалась/есть физически?');
                Report.push('- материал показан правильно, или "не найден"/пусто/не то?');
                Report.push('- попадает ли эта кромка потом в спецификацию/смету по кромке нормально?');

                alert(Report.join('\n'));
            }
        }
    }
} catch (eTop) {
    alert('Ошибка эксперимента: ' + eTop.message);
}
