fastdb = NewParamFastenerDB();

//-- window Window1
Window1 = { Form : NewForm() };
Props = Window1.Form.Properties;
Window1.Form.Width = 451;
Window1.Form.Height = 242;
Window1.Form.Caption = 'Объединение баз параметрического крепежа';
Window1.Form.Resizable = True;
Window1.Form.MinWidth = 400;
Window1.Form.MinHeight = 200;
//-- window Window1 properties

Window1.Group1 = Props.NewGroup('Список баз');
Window1.Group1.SetLayout(1, 1, 338, 217);
Window1.Group1.Align = AlignType.Client;
Window1.Group2 = Props.NewGroup('Действия над базами');
Window1.Group2.SetLayout(339, 1, 117, 217);
Window1.Group2.Align = AlignType.Right;

Window1.ClearBtnsGroup = Window1.Group1.NewGroup('');
Window1.ClearBtnsGroup.SetLayout(128, 15, 20, 153);
Window1.ClearBtnsGroup.Align = AlignType.Right;

Window1.FileNameGroup = Window1.Group1.NewGroup('');
Window1.FileNameGroup.SetLayout(2, 15, 126, 153);
Window1.FileNameGroup.Align = AlignType.Client;

Window1.AddBtn = Window1.Group2.NewButton('Добавить базу');
Window1.AddBtn.SetLayout(2, 55, 113, 40);
Window1.AddBtn.Align = AlignType.Top;
Window1.SaveBtn = Window1.Group2.NewButton('Сохранить все базы');
Window1.SaveBtn.SetLayout(2, 95, 113, 43);
Window1.SaveBtn.Align = AlignType.Top;
//-- window Window1 events

Window1.AddBtn.OnClick = function(){
  AddParamDB();
}
Window1.SaveBtn.OnClick = function(){
  SaveParamDB();
}
//-- window Window1 ends
Window1.Form.ShowModal();

function AddParamDB(){
    dbfile = system.askFileName('config');
    if (UniqueValue(dbfile)){
        var newstring = Window1.FileNameGroup.NewString('Файл базы', dbfile);
        newstring.SetLayout(0, 0, 100, 20);
        newstring.Align = AlignType.Top;
        var newbutton = Window1.ClearBtnsGroup.NewButton('\u2718');
        newbutton.SetLayout(0, 0, 20, 20);
        newbutton.Align = AlignType.Top;
        newbutton.OnClick = function(){
            newstring.Visible = false;
            newbutton.Visible = false;
        }
    }
}

function UniqueValue(value){
    if (!value)
        return false
    for (var i = 0; i < Window1.FileNameGroup.Count; i++){
      if (Window1.FileNameGroup.Items[i].Value === value){
        Window1.FileNameGroup.Items[i].Visible = true;
        Window1.ClearBtnsGroup.Items[i].Visible = true;
        return false;
      }
    }
    return true;
}

function SaveParamDB(){
    dbfile = system.askFileName('config');
    if (dbfile){
        for (var i = 0; i < Window1.FileNameGroup.Count; i++){
            var control = Window1.FileNameGroup.Items[i];
            if (control.Value != '' && control.Visible)
                fastdb.AddFromFile(control.Value);
        }
        fastdb.SaveToFile(dbfile);
        alert('Все базы сохранены в файл ' + dbfile);
        Window1.Form.Close();
    }
}