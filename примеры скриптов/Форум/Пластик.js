FileOptions = 'Save.xml';
MakeProp();
Action.Properties.Load(FileOptions);
Action.OnFinish = function() {
  Action.Properties.Save(FileOptions);
}

BtnOk = NewButtonInput("Закончить")
BtnOk.OnChange = function() {
    PPP()
    Action.Finish()
}

PPP()
Action.Continue()

function PPP()
{
    DeleteNewObjects()
    MatPan.SetActive()
    Pan = AddFrontPanel(0, 0, 300, 600, 100 + MatPl.Thickness)
    Pan.AddPlastic(MatPl.Value, true)
    Pan.AddPlastic(MatPl.Value, false)
    Pan.Build()
}

function MakeProp()
{
    Prop = Action.Properties
    MatPan = Prop.NewMaterial('Панель')
    MatPl = Prop.NewMaterial('Пластик');
    Btn = Prop.NewButton('Построить')

    Prop.OnChange = function() {
        PPP()
    }
    Btn.OnClick =  function() {
        PPP()
        Action.Finish()
    }
}