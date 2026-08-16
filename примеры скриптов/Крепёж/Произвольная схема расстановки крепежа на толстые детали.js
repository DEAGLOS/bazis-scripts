//файл для сохранения настроек
const PROP_FILE = 'customThickScheme.settings';
//Параметры схемы
var schemeParams = {
    // стяжка
    minifix: null,
    //шкант
    pin: null,
    // отступ от краёв
    start: null
}

const vg = vectorGeometry;
//функция установки фурнитуры
// Параметры: простой стык, точка установки, устанавливать ли стяжку
function Mount(conn, point, mountMinifix) {
    //Устанавливаем шкант
    conn.Mount(schemeParams.pin.Value, point);
    if (mountMinifix) {//Если устанавливаем стяжку
        // Добавляем к текущей точке смещение на другую пласть панели 
        // Результат - точка, находящаяся на противоположной пласти панели
        var minifixPoint = vg.VectorAdd(point, vg.VectorMul(conn.WidthDir,
            conn.Panel1.Thickness));
        // устанаваливаем стяжку на противоположную пласть панели
        conn.Mount(schemeParams.minifix.Value, minifixPoint);
    }
}

// функция установки крепежа на конкретный простой стык 
// используется для установки на стык длиной 1501-2200 мм
// Параметр: простой стык
function MountConn(conn) {
    var dir = conn.Dir;
    // прибавляем к началу стыка отступ от края
    var startPoint = vg.VectorAdd(conn.PointStart,
        vg.VectorMul(dir, schemeParams.start.Value));
    // отнимаем от конца стыка отступ от края
    var endPoint = vg.VectorSub(conn.PointEnd,
        vg.VectorMul(dir, schemeParams.start.Value));
    // вычисляем длину расстановки крепежа
    const length = vg.VectorLength(vg.VectorSub(endPoint, startPoint));
    // записываем в отдельную переменную треть длины расстановки
    const length3 = length / 3;
    // Устанавливаем крепёж:
    // 1. В точку начала расстановки
    // 2. На расстоянии 240 от начала расстановки
    // 3. На треть длины расстановки от её (расстановки) начала
    Mount(conn, startPoint, true);
    Mount(conn, vg.VectorAdd(startPoint, vg.VectorMul(dir, 240)))
    Mount(conn, vg.VectorAdd(startPoint, vg.VectorMul(dir, length3)), true);

    // Устанавливаем крепёж:
    // 1. В точку конца расстановки
    // 2. На расстоянии 240 от конца расстановки
    // 3. На треть длины расстановки от её (расстановки) конца
    Mount(conn, endPoint, true);
    Mount(conn, vg.VectorSub(endPoint, vg.VectorMul(dir, 240)))
    Mount(conn, vg.VectorSub(endPoint, vg.VectorMul(dir, length3)), true);
}

// Общая функция установки крепежа на конкретный простой стык
// Параметр: простой стык
function MountConnection(conn) {
    // вычисляем длину всего стыка
    var length = vg.VectorLength(vg.VectorSub(conn.PointEnd, conn.PointStart));
    // точность сравнения вещественных чисел
    var eps = 0.001;
    if (length + eps < 1500) {
        //здесь может быть функция установки крепежа на стык длиной до 1500 мм
    } else if (length + eps < 2200) {
        //устанавливаем крепеж на стык длиной 1501-2200 мм
        MountConn(conn);
    } else {
        //здесь может быть функция установки крепежа на стык длиной от 2201 мм
    }
}

//функция установки крепежа на все найденные стыки
function MountAll() {
    //удаляем ранее поставленный крепёж
    DeleteNewObjects();
    for (var i = 0; i < connection.Count; i++) {
        //для каждого простого стыка вызываем общую функцию установки крепежа
        MountConnection(connection[i]);
    }
}
// Даём пользователю выбрать две панели, на стык которых будет устанавливаться крепёж
var p1 = GetPanel('Укажите первую панель');
var p2 = GetPanel('Укажите вторую панель');
// глобальная переменная (чтобы можно было её получить в теле отдельной функции),
// которая будет содержать в себе составной стык
var connection;
if (!p1 || !p2) //Если не указана хотя бы одна панель, отменяем скрипт
    Action.Cancel();
// Вызываем функцию нахождения составного стыка двух панелей
connection = NewPanelsConnection(p1, p2);
// если стыка панелей не существует, завершаем скрипт
if (!connection)
    Action.Cancel();

//Создаем параметры на панели свойств
var props = Action.Properties;
props.NewString("Установка схемы расстановки крепежа").ReadOnly = true;
schemeParams.minifix = props.NewFurniture("Стяжка");
schemeParams.pin = props.NewFurniture("Шкант");
schemeParams.start = props.NewNumber('Отступ от края');
var invert = props.NewBool('Поменять направление установки фурнитуры');
invert.OnValueChange = () => {
    //Для всех простых стыков меняем начальную и конечную точки местами
    for (var i = 0; i < connection.Count; i++) {
        connection[i].InvertPositions();
    }
    // Переустанавливаем фурнитуру
    MountAll();
}
var side = props.NewBool('Сменить сторону установки фурнитуры');
side.OnValueChange = () => {
    //Для всех простых стыков меняем пласть установки
    for (var i = 0; i < connection.Count; i++) {
        connection[i].ChangeSide();
    }
    // Переустанавливаем фурнитуру
    MountAll();
}
props.NewButton("Установить").OnClick = () => {
    MountAll();
};
props.NewButton("Завершить").OnClick = () => {
    Action.Finish();
}
props.Load(PROP_FILE);

Action.OnFinish = () => {
    Action.Properties.Save(PROP_FILE);
}
Action.Continue();