SetCamera(p3dFront);
Ofset = NewNumberInput("Зазор для двери")
Ofset.Value = 2;

Left = GetEdge("Укажите левую границу", AxisY).First.x;
Right = GetEdge("Укажите правую границу", AxisY).First.x;
Top = GetEdge("Укажите верхнюю границу", AxisX).First.y;
Bottom = GetEdge("Укажите нижнюю границу", AxisX).First.y;

if (Left > Right)
{
    AAA = Left;
    Left = Right;
    Right = AAA;
}
if (Bottom > Top)
{
    AAA = Bottom;
    Bottom = Top;
    Top = AAA;
}

WidthNishe = Right - Left;
DvX1 = Left + Ofset.Value;
DvY1 = Bottom + Ofset.Value;
DvX2 = Right - Ofset.Value;
DvY2 = Top - Ofset.Value;
DvXW = (WidthNishe / 2) + Left;
DvX3 = DvXW - Ofset.Value;
DvX4 = DvXW + Ofset.Value;



    if (WidthNishe < 600)
        Door1();
        else
        Door2();

function Dver(dX1, dY1, dX2, dY2, PZ)
{
    DvBlock = BeginBlock("Дверь рамочная");
    Dvr = AddTrajectory("Дверь");
    Dvr.MaterialName = "Профиль МДФ рамочный";
    Dvr.MaterialWidth = 60;
    Dvr.Trajectory2D.AddRectangle(dX1, dY1, dX2, dY2);
    Dvr.Contour2D.Load("Профиль.frw");
    Dvr.PositionZ = PZ;
    Dvr.Build()
    ActiveMaterial.Make('ДСП EGGER 8 мм', 8); //установка наполнения
    DSP = AddFrontPanel(dX1 + 80.5, dY1 + 80.5, dX2 - 80.5, dY2 - 80.5, PZ + 3);
    DSP.TextureOrientation = ftoVertical;
    DSP.Name = "Панель двери";
    DSP.Build();
    EndBlock();
}

function Door1()
{
    Model.Temp.Clear();
    SetCamera(p3dLeft);
    Front = GetEdge('Укажите переднюю границу', AxisY).First.z;
    PZ = Front;
    Dver(DvX1, DvY1, DvX2, DvY2, PZ);
    DvBlock.AnimType =  AnimationType.DoorLeft;
    SetCamera(p3dFront);
    ViewAll();
}

function Door2()
{
    Model.Temp.Clear();
    SetCamera(p3dLeft);
    Front = GetEdge('Укажите переднюю границу', AxisY).First.z;
    PZ = Front;
    Dver(DvX1, DvY1, DvX3, DvY2, PZ);
    DvBlock.AnimType = AnimationType.DoorLeft;
    Dver(DvX4, DvY1, DvX2, DvY2, PZ);
    DvBlock.AnimType = AnimationType.DoorRight;
    SetCamera(p3dFront);
    ViewAll();
}