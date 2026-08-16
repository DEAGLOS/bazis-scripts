Prop = Action.Properties;
Gsize = Prop.NewGroup('Размеры');
Pw = Gsize.NewNumber('Название', 300);
Ph = Gsize.NewNumber('Название', 200);

Schange = Gsize.NewButton('Задать..');
p1 = NewVector(0, 0, 0);
Schange.OnClick = function() {
    Action.AsyncExec(function() {
      Gsize.Enabled = false;
      p1 = GetPoint("Укажите точку 1");
      p2 = GetPoint("Укажите точку 2");
      Pw.Value = Math.abs(p1.x - p2.x);
      Ph.Value = Math.abs(p1.y - p2.y);
      Gsize.Enabled = true;
    })
};

GMat = Prop.NewGroup('Название');
Mat = GMat.NewMaterial('Название');
Butt = GMat.NewButt('Название');

Prop.OnChange = function() {
  DeleteNewObjects();
  Mat.SetActive();
  p = AddFrontPanel(p1.x, p1.y, p1.x + Pw.Value, p1.y + Ph.Value, p1.z);
  p.AddButt(Butt, 0);
  p.Build();
}

Prop.OnChange();

Prop.NewButton('Установить').OnClick = function() {
  Action.Commit();
}


Action.Continue();