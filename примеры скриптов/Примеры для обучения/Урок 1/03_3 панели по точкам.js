//ѕоставить 3 панели по точкам в виде уголка
//начало p1 конец p2 координата z = координате z точки p1
p1 = GetPoint('”кажите первую точку');
p2 = GetPoint('”кажите вторую точку');
//≈сли указали на виде спереди, то координаты z будут одинаковы
//ѕринудительно присваиваем координату z равную размерам габаритной рамки
if (p1.z == p2.z) p2.z = Model.GMax.z
Thick = ActiveMaterial.Thickness; //—читываем толщину текущего материала
AddVertPanel(p1.z, p1.y, p2.z, p2.y, p1.x);
AddHorizPanel(p1.x + Thick, p1.z, p2.x, p2.z, p1.y);
AddFrontPanel(p1.x + Thick, p1.y + Thick, p2.x, p2.y, p1.z);