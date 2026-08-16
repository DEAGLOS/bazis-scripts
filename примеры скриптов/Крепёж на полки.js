Evrik = OpenFurniture('Полкодержатель.f3d')

Bok1 = GetPanel("Укажите 1-ую вертикальную панель");
Bok2 = GetPanel("Укажите 2-ую вертикальную панель");

x1 = Bok1.GabMax.x + 1;
x2 = Bok2.GabMin.x - 1;

while (true) {
    Polka = GetPanel("Укажите горизонтальную панель");
    Py = Polka.GabMin.y - 1;
    z1 = Polka.GabMin.z;
    z2 = Polka.GabMax.z;

    Evrik.Mount(Polka, Bok1, x1, Py, z1 + 64)
    Evrik.Mount(Polka, Bok2, x2, Py, z1 + 64)

    Evrik.Mount(Polka, Bok1, x1, Py, z2 - 32)
    Evrik.Mount(Polka, Bok2, x2, Py, z2 + 32)
    Action.Commit();
}