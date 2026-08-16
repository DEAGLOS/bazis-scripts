//Расстановка шкантов с чередующимся шагом

const PROP_FILE = 'customPinScheme.settings';

//Параметры схемы расстановки
var schemeParams = {
    /**
     * @type {ScriptFurnitureProperty}
     */
    furn: null,
    /**
     * @type {ScriptNumberProperty}
     */
    start: null,
    /**
     * @type {ScriptNumberProperty}
     */
    end: null,
    /**
     * @type {ScriptNumberProperty}
     */
    step1: null,
    /**
     * @type {ScriptNumberProperty}
     */
    step2: null,
}

const vg = vectorGeometry;

/**
 * Расстановка фурнитуры на простой стык
 * @param {ScriptSimpleConnection} conn 
 */
function MountConnection(conn) {
    // Вектор направления установки
    var dir = conn.Dir;
    // Точка начала установки
    var startPoint = vg.VectorAdd(conn.PointStart, 
        vg.VectorMul(dir, schemeParams.start.Value));
    // Точка конца установки
    var endPoint = vg.VectorSub(conn.PointEnd, 
        vg.VectorMul(dir, schemeParams.end.Value));
    // "чистая" длина стыка с вычтенными отступами
    const length = vg.VectorLength(vg.VectorSub(endPoint, startPoint));
    // Вектор текущей длины, на которой расставлена фурнитура
    var curLengthDir = NewVector();
    // Кол-во установленной фурнитуры
    var count = 0;
    // Выход из цикла осуществляется тогда, когда длина вектора текущей длины
    // будет больше "чистой" длины стыка
    while (vg.VectorLength(curLengthDir) < length) {
        // Опеределяем точку установки фурнитуры
        // Точка начала установки + вектор текущей длины
        var mountPoint = vg.VectorAdd(startPoint, curLengthDir);
        // Добавляем смещение к центру панели 
        // (вектор ширины умножить на половину толщины панели)
        mountPoint = vg.VectorAdd(mountPoint, 
            vg.VectorMul(conn.WidthDir, conn.Panel1.Thickness / 2))
        // Установка фурнитуры в нужную точку
        conn.Mount(schemeParams.furn.Value, mountPoint);
        count++;
        // Если количество крепежа чётное, то к вектору текущей длины добавляем
        // первый шаг. Если нечётно - второй.
        if (count % 2)
            curLengthDir = vg.VectorAdd(curLengthDir, 
                vg.VectorMul(dir, schemeParams.step1.Value));
        else
            curLengthDir = vg.VectorAdd(curLengthDir, 
                vg.VectorMul(dir, schemeParams.step2.Value));
    }
}
// функция расстановки фурнитуры на общий стык панелей
function MountAll() {
    // удаляем старую фурнитуру, установленную скриптом ранее
    DeleteNewObjects();
    // расставляем фурнитуру на каждом простом стыке.
    for (var i = 0; i < connection.Count; i++) {
        MountConnection(connection[i]);
    }
}
// создание параметров расстановки
function MakeProps() {
    var props = Action.Properties;
    props.NewString("Установка шкантов с чередующимся шагом").ReadOnly = true;
    schemeParams.furn = props.NewFurniture("Шкант");
    schemeParams.start = props.NewNumber('Начальный отступ (фиксированный)');
    schemeParams.end = props.NewNumber('Конечный отступ (минимальный)');
    schemeParams.step1 = props.NewNumber("Шаг 1");
    schemeParams.step2 = props.NewNumber("Шаг 2");
    props.NewButton("Установить").OnClick = () => {
        MountAll();
    };
    props.NewButton("Завершить").OnClick = ()=>{
        Action.Finish();
    }
    props.Load(PROP_FILE);
}
// запрашиваем у пользователя панели
var p1 = GetPanel('Укажите первую панель');
var p2 = GetPanel('Укажите вторую панель');
/**
 * @type {ScriptCommonConnection}
 */
var connection;
if (p1 && p2) {
    connection = NewPanelsConnection(p1, p2);
    MakeProps()
}
Action.OnFinish = ()=>{
    Action.Properties.Save(PROP_FILE);
}
Action.Continue();