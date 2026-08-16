function DoInstall(){
    DeleteNewObjects();
    V1 = AddVertPanel(0, 0, 500, 300, 0);
    V2 = AddVertPanel(0, 0, 150, 300, 200);
    H = AddHorizPanel(V1.Thickness, 0, 200, 500, 100);

//    alert(Window1.FurnCount.Value);
    Scheme = NewScheme(Window1.SchemeName.Value); //обязательный параметр: имя не должно быть пустым
    Scheme.SchemeType = Window1.SchemeType.ItemIndex; //по умолчанию с фикс. отступом
    Scheme.Furniture = Window1.Furn.Value; //Обязательный параметр - ставить что-то надо
    Scheme.AdditionalFurn = Window1.AdFurn.Value;
    Scheme.FixBaseIndent = Window1.StartIndent.Value; //по умолчанию 0
                                                      // идентично свойству Scheme.MinSymmetricIndent
    Scheme.Percent = Window1.Percent.Value; // по умолчанию false
    Scheme.FixSymmetricIndent = Window1.FixIndent.Value; // по умолчанию false
    Scheme.MinBaseIndent = Window1.EndIndent.Value; //по умолчанию 0
    Scheme.SetFurnitureCount(Window1.FurnCount.Value); //по умолчанию 2
    Scheme.FurnitureStep = Window1.FurnStep.Value; // значение по умолчанию 32
    Scheme.AdditionalFurnStep = Window1.AdFurnStep.Value; // значение по умолчанию 32
//    alert(Window1.FurnCount.Value);
    Scheme.Mount(V1, H);  // скрепляет две панели по схеме.
}

//-- window Window1
Window1 = { Form : NewForm() };
Props = Window1.Form.Properties;
Window1.Form.Width = 299;
Window1.Form.Height = 340;
Window1.Form.Caption = 'Window1';
//-- window Window1 properties

Window1.Group1 = Props.NewGroup('Параметры схемы');
Window1.Group1.SetLayout(1, 1, 208, 253);
Window1.Group1.Align  = AlignType.Top;

Window1.SchemeName = Window1.Group1.NewString('Имя схемы');
Window1.SchemeName.SetLayout(2, 15, 204, 20);
Window1.SchemeName.Value = 'Scheme1';
Window1.SchemeName.Align  = AlignType.Top;

Window1.SchemeType = Window1.Group1.NewCombo('Тип схемы', '');
Window1.SchemeType.SetLayout(2, 35, 263, 20);
Window1.SchemeType.Align  = AlignType.Top;
Window1.SchemeType.AddItem('С фиксированным отступом');
Window1.SchemeType.AddItem('Симметричная');
Window1.SchemeType.AddItem('С переменным шагом');

Window1.Furn = Window1.Group1.NewFurniture('Основная фурнитура');
Window1.Furn.SetLayout(2, 55, 204, 20);
Window1.Furn.Align  = AlignType.Top;
Window1.AdFurn = Window1.Group1.NewFurniture('Дополнительная фурнитура');
Window1.AdFurn.SetLayout(2, 75, 316, 20);
Window1.AdFurn.Align  = AlignType.Top;

Window1.StartIndent = Window1.Group1.NewNumber('Фиксированный отступ от базы');
Window1.StartIndent.SetLayout(2, 95, 293, 20);
Window1.StartIndent.Align  = AlignType.Top;
Window1.Percent = Window1.Group1.NewBool('Отступ в процентах', false);
Window1.Percent.SetLayout(2, 115, 293, 20);
Window1.Percent.Visible = False;
Window1.Percent.Align  = AlignType.Top;
Window1.FixIndent = Window1.Group1.NewBool('Фиксировать отступ', false);
Window1.FixIndent.SetLayout(2, 135, 293, 20);
Window1.FixIndent.Visible = False;
Window1.FixIndent.Align  = AlignType.Top;
Window1.EndIndent = Window1.Group1.NewNumber('Минимальный отступ');
Window1.EndIndent.SetLayout(2, 155, 293, 20);
Window1.EndIndent.Align  = AlignType.Top;

Window1.FurnCount = Window1.Group1.NewNumber('Количество фурнитуры');
Window1.FurnCount.SetLayout(2, 175, 263, 20);
Window1.FurnCount.Value = 2;
Window1.FurnCount.Align  = AlignType.Top;
Window1.FurnStep = Window1.Group1.NewNumber('Кратность шага основного крепежа');
Window1.FurnStep.SetLayout(2, 195, 263, 20);
Window1.FurnStep.Value = 32;
Window1.FurnStep.Align  = AlignType.Top;
Window1.AdFurnStep = Window1.Group1.NewNumber('Кратность шага дополнительного крепежа');
Window1.AdFurnStep.SetLayout(2, 215, 263, 20);
Window1.AdFurnStep.Value = 32;
Window1.AdFurnStep.Align  = AlignType.Top;

Window1.InstallFurn = Props.NewButton('Установить крепеж');
Window1.InstallFurn.SetLayout(1, 254, 297, 31);
Window1.InstallFurn.Align  = AlignType.Top;
Window1.Button1 = Props.NewButton('Завершить скрипт');
Window1.Button1.SetLayout(1, 285, 297, 32);
Window1.Button1.Align  = AlignType.Top;
//-- window Window1 events

Window1.InstallFurn.OnClick = function(){
    DoInstall();
}
Window1.Form.OnClose = function(){
    Action.Finish();
}
Window1.Button1.OnClick = function(){
    Window1.Form.Close();
}

Window1.SchemeType.OnChange = function(){
    switch (Window1.SchemeType.ItemIndex)
    {
        case 0: EnableWithBaseProps(); break;
        case 1: EnableSymmetricProps(); break;
        case 2: EnableVarStepProps(); break;
    }
}

function EnableWithBaseProps(){
    Window1.AdFurn.Visible = true;
    Window1.StartIndent.Visible = true;
    Window1.FixIndent.Visible = false;
    Window1.Percent.Visible = false;
    Window1.EndIndent.Visible = true;
    Window1.FurnCount.Visible = true;
    Window1.AdFurnStep.Visible = true;
    Window1.StartIndent.Name = 'Фиксированный отступ от базы';
}

function EnableSymmetricProps(){
    Window1.AdFurn.Visible = true;
    Window1.StartIndent.Visible = true;
    Window1.FixIndent.Visible = true;
    Window1.Percent.Visible = true;
    Window1.EndIndent.Visible = false;
    Window1.FurnCount.Visible = true;
    Window1.AdFurnStep.Visible = true;
    if (Window1.FixIndent.Value)
        Window1.StartIndent.Name = 'Фиксированный отступ от краев';
    else
        Window1.StartIndent.Name = 'Минимальный отступ от краев';
}

function EnableVarStepProps(){
    Window1.AdFurn.Visible = false;
    Window1.StartIndent.Visible = false;
    Window1.FixIndent.Visible = false;
    Window1.Percent.Visible = false;
    Window1.EndIndent.Visible = false;
    Window1.FurnCount.Visible = false;
    Window1.AdFurnStep.Visible = false;
}


Window1.FixIndent.OnChange = function(){
    if (Window1.FixIndent.Value)
        Window1.StartIndent.Name = 'Фиксированный отступ от краев';
    else
        Window1.StartIndent.Name = 'Минимальный отступ от краев';
}
//-- window Window1 ends
Window1.Form.Show(WindowPosition.Left);