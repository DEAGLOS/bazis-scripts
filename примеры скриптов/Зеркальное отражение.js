// создадим панель с фаской
P = AddPanel(100, 200);
P.Contour.Facet(0, 0, 40);
// отразим панель относительно точки (150, 0, 0) вдоль оси Х
newP = AddSymmetry(P, NewVector(150, 0, 0), AxisX);