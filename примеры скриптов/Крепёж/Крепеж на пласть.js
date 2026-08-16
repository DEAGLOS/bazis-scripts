Handle = OpenFurniture('Ручка.f3d');
Lag = OpenFurniture('Опора.f3d');

// ручки на фронтальную панель
P1 = AddFrontPanel(0, 0, 200, 300, 200);
Handle.Mount1(P1, 100, 100, 350, 0);
Handle.Mount1(P1, 100, 250, 350, 90);

// ручки на вертикальные панели панель
P2 = AddVertPanel(0, 0, 200, 250, -70);
Handle.Mount1(P2, -70, 100, 100, 45);
Handle.Mount1(P2, -70, 200, 100, 90);
P3 = AddVertPanel(0, 0, 200, 250, 270);
Handle.Mount1(P3, 290, 100, 100, -45);
Handle.Mount1(P3, 290, 200, 100, 90);

// ножки на горизонтальные
P4 = AddHorizPanel(-20, 30, 220, 180, -50);
Lag.Mount1(P4, 30, -50, 100, 0);
Lag.Mount1(P4, 180, -50, 100, 45);