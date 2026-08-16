//Поставить 3 панели по точкам в виде уголка
//начало p1 конец p2 координата
Otstup = NewFloatInput('Отступ от края');
Otstup.Value = 40;
Diam = NewFloatInput('Диаметр');
Diam.Value = 200;
Rad = NewFloatInput('Радиус');
Rad.Value = 30;
//Считываем толщину текущего материала
Thick = MtThickness();

//Делаем бесконечный цикл для последовательного построения
//Выход из него по правой кнопке мыши - Отменить команду
while (true)
{
    p1 = GetPoint('Укажите первую точку');
    p2 = GetPoint('Укажите вторую точку');
    //Если указали на виде спереди, то координаты z будут одинаковы
    //Принудительно присваиваем координату z равную размерам габаритной рамки
    if (p1.z == p2.z) p2.z = Model.GMax.z

    //Если указали точки в неправильном порядке, то меняем координаты
    if (p1.z > p2.z)
      {
        rrr = p1.z;
        p1.z = p2.z;
        p2.z = rrr;
      }
    if (p1.y > p2.y)
      {
        rrr = p1.y;
        p1.y = p2.y;
        p2.y = rrr;
      }
    if (p1.x > p2.x)
      {
        rrr = p1.x;
        p1.x = p2.x;
        p2.x = rrr;
      }
//Вызываем функцию построения всех панелей
    Make();
}

function Make()
{
    Panel = AddVertPanel(p1.z, p1.y, p2.z, p2.y, p1.x);
    //Присваиваем панели имя
    Panel.Name = 'Левая боковина';
    //Добавляем окружность к контуру панели
    Panel.Contour.AddCircle((p2.z - p1.z) / 2, (p2.y - p1.y) / 2,
        Diam.Value / 2);
    //Строим панель с измененным контуром
    Panel.Build();

    Panel = AddHorizPanel(p1.x + Thick, p1.z,
        p2.x, p2.z, p1.y);
    //Присваиваем панели имя
    Panel.Name = 'Низ';
    //Добавляем прямоугольник к контуру панели
    Panel.Contour.AddRectangle(Otstup.Value, -Otstup.Value,
        p2.x - p1.x - Thick - Otstup.Value, -(p2.z - p1.z - Otstup.Value));
    //Строим панель с измененным контуром
    Panel.Build();

    Panel = AddFrontPanel(p1.x + Thick, p1.y + Thick, p2.x, p2.y, p1.z);
    //Присваиваем панели имя
    Panel.Name = 'Задняя стенка';
    //Добавляем прямоугольник со скруглениями к контуру панели
    Panel.Contour.AddRoundRect(Otstup.Value, Otstup.Value,
        p2.x - p1.x - Thick - Otstup.Value, p2.y - p1.y - Thick - Otstup.Value,
        Rad.Value);
    //Строим панель с измененным контуром
    Panel.Build();
    //Передаем панель в область Базиса и очищаем область скрипта
    Action.Commit();
}
