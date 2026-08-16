V1 = AddVertPanel(0, 0, 500, 300, 0);
V2 = AddVertPanel(0, 0, 500, 300, 200);
H = AddHorizPanel(V1.Thickness, 0, 200, 500, 100);

Scheme = OpenScheme('Schemes.config','Ст+Шкант');
Scheme.FurniturePosition = FurniturePosition.Down;
Scheme.Mount(V1, H);
Scheme.FurniturePosition = FurniturePosition.Up;
Scheme.Mount(V2, H);