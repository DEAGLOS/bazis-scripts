//Поставить 3 панели по точкам в виде уголка
//начало p1 конец p2 координата
Otstup = 40;
Diam = 200;
Rad = 30;
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

//Считываем толщину текущего материала
Thick = ActiveMaterial.Thickness;

Panel = AddVertPanel(p1.z, p1.y, p2.z, p2.y, p1.x);
//Добавляем окружность к контуру панели
Panel.Contour.AddCircle((p2.z - p1.z) / 2, (p2.y - p1.y) / 2, Diam / 2);

Panel = AddHorizPanel(p1.x + Thick, p1.z, p2.x, p2.z, p1.y);
//Добавляем прямоугольник к контуру панели
Panel.Contour.AddRectangle(Otstup, -Otstup, p2.x - p1.x - Thick - Otstup, -(p2.z - p1.z - Otstup));

Panel = AddFrontPanel(p1.x + Thick, p1.y + Thick, p2.x, p2.y, p1.z);
//Добавляем прямоугольник со скруглениями к контуру панели
Panel.Contour.AddRoundRect(Otstup, Otstup, p2.x - p1.x - Thick - Otstup, p2.y - p1.y - Thick - Otstup, Rad);