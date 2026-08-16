const PROP_FILE = 'customParamScheme.settings';
const vg = vectorGeometry;
/**
 * 
 * @param {ScriptSimpleConnection} conn 
 */
function MountConnection(conn) {
    // устанавливаем переменные, доступные при вводе расстояния
    // Общая длина стыка
    const L = vg.VectorLength(vg.VectorSub(conn.PointEnd, conn.PointStart));
    // длина с учетом отступов
    const l = L - (start.Value + end.Value);
    // предыдущее расстояние при установке крепежа
    var prev = 0;
    // начальный отступ
    const s = start.Value;
    // Конечный отступ
    const e = end.Value;

    const dir = conn.Dir;
    const pointStart = conn.PointStart;
    // Идем по всем элементам груупы
    for (var i = 0; i < grp.Count; i++) {
        var str = grp.Items[i];
        // Если строка не пустая
        if (str.Value !== '') {
            // Выполняем выражение и получаем значение интервала
            var interval = eval(str.Value);
            // записываем текущий интервал, который на следующей итерации 
            //   будет уже "предыдущим"
            prev = interval;
            // создаем точку установки фурнитуры
            // (начало + направление * расстояние)
            var mountPoint = vg.VectorAdd(pointStart, vg.VectorMul(dir, interval));
            //Устанавливаем основную фурнитуру в точку установки
            conn.Mount(primFurn.Value, mountPoint);
            // вычисляем вектор направления "внутрь стыка"
            // если расстояние меньше половины длины (с точностью 0.001),
            // то используем вектор напрвления установки
            // иначе используем инвертированный вектор напрвления установки
            var insideDir = interval < L / 2 + 0.001 ?
                dir :
                vg.VectorNegate(dir);
            //Выбираем индекс выбранного элемента в списке "Доп фурнитура"
            // при индексе 0 ничего делать не надо
            switch (str.Items[0].ItemIndex) {
                // если ставим 2 крепежа, то ставим сначала крепеж дальше от
                // центра стыка
                case 2:
                    var advMountPoint = vg.VectorSub(mountPoint,
                        vg.VectorMul(insideDir, advStep.Value));
                    conn.Mount(advFurn.Value, advMountPoint);
                //т.к. нет прекращения (break), выполняем код ниже

                // установка крепежа ближе к стыку
                // (выполняется и в случае с ItemIndex = 2)
                case 1:
                    mountPoint = vg.VectorAdd(mountPoint,
                        vg.VectorMul(insideDir, advStep.Value))
                    conn.Mount(advFurn.Value, mountPoint);
            }

        }
    }
}

function MountAll() {
    // Удаляем ранее поставленную скриптом фурнитуру
    DeleteNewObjects();
    // устанавливаем крепеж по на все обнаруженные стыки
    for (var i = 0; i < connection.Count; i++) {
        MountConnection(connection[i]);
    }
}

var p1 = GetPanel("Укажите первую панель");
var p2 = GetPanel("Укажите вторую панель");
// если хотя бы одной из панелей не существует, завершаем скрипт
if (!p1 || !p2)
    Action.Cancel();
var connection = NewPanelsConnection(p1, p2);
// если стыка панелей не существует, завершаем скрипт
if (!connection)
    Action.Cancel();

//Создаем параметры на панели свойств
var props = Action.Properties;
props.NewString("Установка произвольной схемы").ReadOnly = true;
var primFurn = props.NewFurniture("Основная фурнитура");
var advFurn = props.NewFurniture("Дополнительная фурнитура");
var advStep = props.NewNumber('Отступ дополнитльной фурнитуры от основной');
var start = props.NewNumber('Начальный отступ');
var end = props.NewNumber('Конечный отступ');
var invert = props.NewBool('Поменять направление установки фурнитуры');
invert.OnValueChange = () => {
    //для всех обнаруженных стыков меняем начальную и конечную точки местами
    for (var i = 0; i < connection.Count; i++) {
        connection[i].InvertPositions();
    }
    MountAll();
}
var side = props.NewBool('Сменить сторону установки фурнитуры');
side.OnValueChange = () => {
    //для всех обнаруженных стыков меняем сторону установки фурнитуры
    for (var i = 0; i < connection.Count; i++) {
        connection[i].ChangeSide();
    }
    MountAll();
}
props.NewButton('Доступные параметры').OnClick = () => {
    alert([
        'Для задания расстояний можно использовать следующие параметры:',
        'L - длина стыка панелей',
        'l (строчная L) - длина стыка с вычтенными отступами',
        's - начальный отступ',
        'e - конечный отступ',
        'prev - расстояние установки предыдущего крепежа'
    ].join('\n'));
}
var grp = props.NewNumber('Количество межосевых расстояний');
// выставляем параметр "Округлять число"
grp.WholeNumber = true;
// Добавление нового параметра межосевых расстояний
function AddDistance() {
    var str = grp.NewString(grp.Count + 1);
    var cmb = str.NewCombo("Дополнительная фурнитура", 'Не ставить');
    cmb.AddItem('Ставить 1');
    cmb.AddItem('Ставить 2');
}
// Функция изменения количества межосевых расстояний
function FurnCountChanged() {
    if (grp.Value < grp.Count) {
        grp.Clear();
    }
    while (grp.Count !== grp.Value) {
        AddDistance();
    }
}
grp.Value = 3; // По умолчанию ставим 3 межосевых расстояния
grp.OnValueChange = FurnCountChanged;
FurnCountChanged();

props.NewSeparator();

props.NewButton("Установить").OnClick = () => {
    MountAll();
};
props.NewButton("Завершить").OnClick = () => {
    Action.Finish();
}
props.Load(PROP_FILE);
// После загрузки свойств изменяем количество межосевых расстояний при 
// несоответствии кол-ва со значением в поле, и загружаем параметры расстояний
if (grp.Value !== grp.Count)
    FurnCountChanged();
props.Load(PROP_FILE);

Action.OnFinish = () => {
    // При зваершении скрипта сохраняем текущие настройки.
    props.Save(PROP_FILE);
}
Action.Continue();

