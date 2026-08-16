// задание полей ввода
SideMat = NewMaterialInput('Боковины');
DepthVal = NewFloatInput('Глубина');
DepthVal.Value = Model.GSize.z;
ShelfMat = NewMaterialInput('Полки');
ShelfCount = NewNumberInput('Количество');
ShelfCount.Value = 5;
ShelfOffset = NewNumberInput('Отступ');
ShelfOffset.Value = 2;
ShelfFast = NewFurnitureInput('Крепёж');

// запрос габаритов ниши
Left = GetEdge('Укажите левую границу', AxisY).First.x;
Right = GetEdge('Укажите правую границу', AxisY).First.x;
Top = GetEdge('Укажите верхнюю границу', AxisX).First.y;
Bottom = GetEdge('Укажите нижнюю границу', AxisX).First.y;

MakeShelf();
OkBtn = NewButtonInput('Построить');
Action.Continue(); // не завершать  действие

function MakeShelf() {
    DeleteNewObjects(); // удалить объкты созданные в этой команде
    Depth = DepthVal.Value;
    Offset = ShelfOffset.Value;
    Count = ShelfCount.Value;
    SideMat.SetActive(); // строить боковины из материала указнного в SideMat
    LeftPanel = AddVertPanel(0, Bottom, Depth, Top, Left);
    RightPanel = AddVertPanel(0, Bottom, Depth, Top, Right - SideMat.Thickness);

    PosY = Bottom;
    SectionHeight = Top - Bottom;
    YInc = (SectionHeight - Count * ShelfMat.Thickness) / (Count + 1);

    ShLeft = Left + SideMat.Thickness + Offset;
    ShRight = Right - SideMat.Thickness - Offset;

    ShelfMat.SetActive(); // строить полки из материала указнного в ShelfMat
    BeginBlock("Полки");
    for (var k = 0; k < Count; k++) {
        PosY += YInc;
        Panel = AddHorizPanel(ShLeft, 0, ShRight, Depth, PosY);
        // закрепить полки крепежом выбранным в ShelfFast на боковинах
        ShelfFast.Mount(Panel, LeftPanel, ShLeft, PosY, 32);
        ShelfFast.Mount(Panel, RightPanel, ShRight, PosY, 32);
        ShelfFast.Mount(Panel, LeftPanel, ShLeft, PosY, Depth - 32);
        ShelfFast.Mount(Panel, RightPanel, ShRight, PosY, Depth - 32);
        PosY += ShelfMat.Thickness;
    }
    EndBlock();
}

function $input(id) {
    MakeShelf();
    if (id == OkBtn.id)
        return true; // завершть команду построения
}