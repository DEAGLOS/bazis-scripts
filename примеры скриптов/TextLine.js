FileOptions = 'text.xml';
MakeProperties();
Action.Properties.Load(FileOptions);
Action.OnFinish = function() {
	Action.Properties.Save(FileOptions);
}

function MakeProperties() {
Prop = Action.Properties;
SizePar = Prop.NewNumber('Размер текста', 30);
ColorPar = Prop.NewColor('Цвет');
}

BtnMake = NewButtonInput('Закончить');
BtnMake.OnChange = function() {
Action.Finish();
}

symbols = JSON.parse( system.readTextFile('Font.json') ).Font.Symbols.Symbol;
smbMap = {};
for (var k = 0; k < symbols.length; ++k) {
    var symbol = symbols[k];
    smbMap[symbol.ID] = symbol;
}

    P1 = GetPoint("Укажите точку начала");
    P2 = GetPoint("Укажите точку конца");
    var text = prompt("Введите текст", 'Привет Базис');

    var dir = NewVector(P2.x - P1.x, P2.y - P1.y, P2.z - P1.z);
    Text3D = AddContour();
    Text3D.Name = 'Текст: '+text;
    var axisY = Vector.cross(dir, Action.ViewDir, NewVector());
    var il = 1 / Math.sqrt(axisY.x * axisY.x + axisY.y * axisY.y + axisY.z * axisY.z);
    axisY.x *= il;
    axisY.y *= il;
    axisY.z *= il;
    Text3D.OrientGCS(Vector.negative(Action.ViewDir), axisY);
    Text3D.Color = ColorPar.Value;
    TextContour = Text3D.Contour;
    PosX = 0;

    var scale = SizePar.Value;

    for (var i = 0; i < text.length; ++i) {
      var id = text.charCodeAt(i);
      if (id >= 1040) {
        id = id - 1040 + 192;
      }
      var symbol = smbMap[id];
      if (symbol) {
        if (symbol.Lines) {
            var lines = symbol.Lines.Line;
            for (var k = 0; k < lines.length; ++k) {
              var line = lines[k];
              TextContour.AddLine(parseFloat(line.x1) * scale + PosX,
                                  parseFloat(line.y1) * scale,
                                  parseFloat(line.x2) * scale + PosX,
                                  parseFloat(line.y2) * scale);
            }
        }
        PosX += symbol.IncX * scale;
      }
    }

    Text3D.Position = P1;
    Text3D.Build();
