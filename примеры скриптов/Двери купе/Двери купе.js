SetCamera(p3dFront);

OkBtn = NewButtonInput("Построить")
        OkBtn.OnChange = function() {
        Action.Finish()
        }

Left = GetEdge("Укажите левую границу", AxisY).First.x;
Right = GetEdge("Укажите правую границу", AxisY).First.x;
Top = GetEdge("Укажите верхнюю границу", AxisX).First.y;
Bottom = GetEdge("Укажите нижнюю границу", AxisX).First.y;
SetCamera(p3dLeft);
Front = GetEdge('Укажите переднюю границу', AxisY).First.z;

if (Left > Right) {
    AAA = Left;
    Left = Right;
    Right = AAA;
}
if (Bottom > Top) {
    AAA = Bottom;
    Bottom = Top;
    Top = AAA;
}

FileOptions = 'SaveKupe.xml';
MakeProp();
Action.Properties.Load(FileOptions);
Action.OnFinish = function() {
    Action.Properties.Save(FileOptions);
}

function MakeProp()
{
    Prop = Action.Properties;
    VidProf = Prop.NewCombo('Тип профиля ручки',  'Профиль С\nПрофиль Н');

    KolDv = Prop.NewCombo('Количество дверей',  '2\n3\n4\n5');
    KolDv.OnChange = function ()
    {
        KolDv.ChildrenEnabled = KolDv.Value;
    }
    Centr4 = KolDv.NewBool('Две центральные спереди');
    if (KolDv.ItemIndex == 2)
        Centr4.Visible = true
    else
        Centr4.Visible = false

    KolRaz = Prop.NewCombo('Количество секция',  '1\n2\n3\n4\n5\n6\n7')
    ColorProf = Prop.NewCombo('Цвет профиля',  'Золото матовое\nХром матовый\nБлестящая бронза\nШампань матовая\nШампань блестящая\nВенге\nВишня\nДуб дымчатый\nОрех итальянский\nОрех французский\nВенге темный')
    Prop.OnChange = function ()
    {
        if (KolDv.ItemIndex == 2)
            Centr4.Visible = true
        else
            Centr4.Visible = false

            DeleteNewObjects();
            PR()
            Raschet();
            MakeNap();
            MakeDoors();
     }

    Btn = Prop.NewButton('Построить')
    Btn.OnClick = function()
    {
        Action.Finish()
    }
}

KolRaz.OnChange = function () {
    DeleteNewObjects();
    Raschet();
    MakeNap();
    MakeDoors();
}

KolDv.OnChange = function () {
    DeleteNewObjects();
    Raschet();
    MakeNap();
    MakeDoors();
}

//задание параметров профилей, ниши и т.д.
WidthNiche = Right - Left; //ширина ниши
HeightNiche = Top - Bottom; //высота ниши
LengthNaprav = WidthNiche - 2; //длина нижней и верхней направляющих
HeightProf = HeightNiche - 40; //высота профиля ручки
HeightProfBot = 56; //высота нижнего профиля двери
HeightProfTop = 21; //высота верхнего профиля двери
HeightProfCentr = 25; //высота среднего профиля двери
ThickRamcka = 14.5; //толщина горизонтальных профилей двери
ThickNapBot = 8; //толщина нижней направляющей
WidthNapBot = 63; //ширина нижней направляющей
WidthNapTop = 82; //ширина верхней направляющей
ZagNapol = 8; //заглубление наполнения двери толщиной 10 мм
ZdvigProf = 8.75; //здиг асимметричного профиля относительно симметричного
ZaglubRam = 0.5; //заглубление горизонтальных профилей в профиль ручку
AxisFront = WidthNapTop * 0.5; //Z передней двери
AxisBack = WidthNapTop * 0.75; //Z задней двери
ZvigNapBot = (WidthNapTop - WidthNapBot) * 0.5;

function PR()
{
    if (VidProf.ItemIndex == 0)
    {
        WidthProf = 26; //ширина асимметричного профиля двери
        ThickProf = 34; //толщина асимметричного профиля двери
        //Положенеие по глубине задней двери для асимметричного профиля
        ZdvigRamckaCback = Front - AxisBack - (ThickRamcka * 0.5) - ZdvigProf;//горизонтальные профиля
        DspProfCback = Front - AxisBack - (10 / 2) - ZdvigProf;//ДСП (наполнение)
        ZdvigProfCback = Front - AxisBack - (ThickProf * 0.5);//профиль ручка
        NapZ = Front - ZvigNapBot - ZdvigProf;//Z нижней направляющей для асимметричного профиля
        CutProf = 'Профиль С.frw';
        MaterialProf = 'Ветрикальный профиль С ' + ColorProf.Value;
    }
    else
    {
        WidthProf = 35; //ширина симметричного профиля двери
        ThickProf = 34; //толщина симметричного профиля двери
        //Положенеие по глубине задней двери для симметричного профиля
        ZdvigRamckaCback = Front - AxisBack - (ThickRamcka * 0.5);
        DspProfCback = Front - AxisBack - (10 / 2); //ДСП (наполнение)
        ZdvigProfCback = Front - AxisBack - (ThickProf * 0.5);//профиль ручка
        NapZ = Front - ZvigNapBot;//Z нижней направляющей для симметричного профиля
        CutProf = 'Профиль Н.frw';
        MaterialProf = 'Ветрикальный профиль Н ' + ColorProf.Value;
    }
}

function Raschet()
{
    Nalog = KolDv.Value - 1; //кол-во пересечений дверей
    //system.log("Ниша = " + WidthNiche);
    WidthDver = ((WidthNiche + (WidthProf * Nalog)) / KolDv.Value); //ширина двери
    WidthDverC = Math.floor(WidthDver);
    Ost = ((WidthNiche + (WidthProf * Nalog)) % WidthDverC) / KolDv.Value;
    if (Ost > 0)
        Add = 1
        else
        Add = 0
    WidthDverC1 = WidthDverC + Add;
    Ost3 = (1 - Ost) * KolDv.Value;
    ZdviX = Ost3 * 0.25;
    LengthProfRam = (WidthDverC1 - (WidthProf * 2)) + (ZaglubRam * 2); //длинна горизонтальныз профилей
    LengthProfRam1 = Math.floor(LengthProfRam);
    //параметры для установки разделительного профиля
    Count = KolRaz.Value;
    Raztop = Top - 30 - HeightProfTop;//верх ниши
    Razbotton = Bottom + 10 + HeightProfBot;//низ ниши
    SectionRaz = Raztop - Razbotton;
    Section = (SectionRaz - ((Count - 1) * HeightProfCentr)) / Count;
    //определение параметров для установки элементов дверей по оси X
    LeftX = Left + WidthProf; //левая граница + толщина профиля ручки
    RightX = WidthDverC1 - WidthProf; //правая граница - толщина профиля рчки
    LeftDsp = LeftX - ZagNapol; //граница наполнения слева
    RightDsp = RightX + ZagNapol + Left; //граница наполнения справа
    LeftRam = Left + WidthProf - ZaglubRam; //граница слева горизонт профилей
    SN = (WidthNiche * 0.5);
    SN1 = Math.floor(SN);
    //координаты установки дверей
    HalfProf = WidthProf * 0.5
    Right5 = WidthNiche - WidthDverC1;//координата Х правой двери
    Right3 = SN - (WidthDverC1 * 0.5)
}

function Doors4()
{
    WidthDver = (WidthNiche + (WidthProf * 2)) / KolDv.Value; //ширина двери
    WidthDverC = Math.floor(WidthDver);
    Ost = ((WidthNiche + (WidthProf * 2)) % WidthDverC) / KolDv.Value;
    if (Ost > 0)
        Add = 1
        else
        Add = 0
    WidthDverC1 = WidthDverC + Add;
    Ost3 = (1 - Ost) * KolDv.Value;
    ZdviX = Ost3 * 0.5;
    LengthProfRam = (WidthDverC1 - (WidthProf * 2)) + (ZaglubRam * 2); //длинна горизонтальныз профилей
    LengthProfRam1 = Math.floor(LengthProfRam);
    RightX = WidthDverC1 - WidthProf; //правая граница - толщина профиля рчки
    RightDsp = RightX + ZagNapol + Left; //граница наполнения справа
    Right5 = WidthNiche - WidthDverC1;//координата Х правой двери
}

function MakeNap()
{
    BotNap = AddExtrusion(); //нижняя направляющая для асимметричного профиля
    BotNap.MaterialName = "Направляющая нижняя двухполозная " + ColorProf.Value;
    BotNap.MaterialWidth = WidthNapBot;
    File = 'Направляющая нижняя.frw';
    BotNap.Contour.Load(File);
    BotNap.Rotate(AxisY, -90);
    BotNap.Thickness = LengthNaprav;
    BotNap.Position = NewVector(Right - 1, Bottom, NapZ)
    BotNap.Name = "Направляющая нижняя";
    BotNap.Build();
    TopNap = AddExtrusion(); //верхняя направляющая
    TopNap.MaterialName = "Направляющая верхняя двухполозная " + ColorProf.Value;
    TopNap.MaterialWidth = WidthNapTop;
    File = 'Направляющая верхняя.frw';
    TopNap.Contour.Load(File);
    TopNap.Rotate(AxisY, -90);
    TopNap.Thickness = LengthNaprav;
    TopNap.Position = NewVector(Right - 1, Top, Front)
    TopNap.Name = "Направляющая верхняя";
    TopNap.Build();
}

function MakeDoors()
{
    switch (KolDv.ItemIndex)
    {
        case 0:
            DverC();//установка 1-ой двери
            BlDoorC2 = AddCopy(BlDoorC);//установка 2-ой двери
            BlDoorC2.Position = NewVector(Right5, 0, AxisFront)
            BlDoorC.AnimType = AnimationType.SDoorLeft;
            BlDoorC2.AnimType = AnimationType.SDoorRight;
            BlDoorC2.Build();
            break
        case 1:
            DverC();//установка 1-ой двери
            BlDoorC2 = AddCopy(BlDoorC);//установка 2-ой двери
            BlDoorC2.Position = NewVector(Right3, 0, AxisFront)
            BlDoorC3 = AddCopy(BlDoorC);//установка 3-ей двери
            BlDoorC3.Position = NewVector(Right5, 0, 0)
            BlDoorC.AnimType = AnimationType.SDoorLeft;
            BlDoorC2.AnimType = AnimationType.SDoorRight;
            BlDoorC3.AnimType = AnimationType.SDoorRight;
            BlDoorC2.Build();
            BlDoorC3.Build();
            break
         case 2:
            if (Centr4.Value == true)
            {
                Doors4();
                DverC();//установка 1-ой двери
                BlDoorC2 = AddCopy(BlDoorC);//установка 2-ой двери
                BlDoorC2.Position = NewVector(SN - WidthDverC1, 0, AxisFront);
                BlDoorC3 = AddCopy(BlDoorC);//установка 3-ей двери
                BlDoorC3.Position = NewVector(SN, 0, AxisFront);
                BlDoorC4 = AddCopy(BlDoorC);//установка 4-ой двери
                BlDoorC4.Position = NewVector(Right5, 0, 0);
                BlDoorC.AnimType = AnimationType.SDoorLeft;
                BlDoorC2.AnimType = AnimationType.SDoorRight;
                BlDoorC3.AnimType = AnimationType.SDoorLeft;
                BlDoorC4.AnimType = AnimationType.SDoorRight;
                BlDoorC2.Build();
                BlDoorC3.Build();
                BlDoorC4.Build();
            }
            else
            {
                DverC();//установка 1-ой двери
                BlDoorC2 = AddCopy(BlDoorC);//установка 2-ой двери
                BlDoorC2.Position = NewVector((SN - WidthDverC1 + HalfProf), 0, AxisFront);
                BlDoorC3 = AddCopy(BlDoorC);//установка 3-ей двери
                BlDoorC3.Position = NewVector((SN - WidthProf * 0.5), 0, 0);
                BlDoorC4 = AddCopy(BlDoorC);//установка 4-ой двери
                BlDoorC4.Position = NewVector(Right5, 0, AxisFront);
                BlDoorC.AnimType = AnimationType.SDoorLeft;
                BlDoorC2.AnimType = AnimationType.SDoorRight;
                BlDoorC3.AnimType = AnimationType.SDoorLeft;
                BlDoorC4.AnimType = AnimationType.SDoorRight;
                BlDoorC2.Build();
                BlDoorC3.Build();
                BlDoorC4.Build();
            }
            break
        case 3:
            DverC();//установка 1-ой двери
            BlDoorC2 = AddCopy(BlDoorC);//установка 2-ой двери
            BlDoorC2.Position = NewVector((WidthDverC1 - ZdviX - WidthProf), 0, AxisFront);
            BlDoorC3 = AddCopy(BlDoorC);//установка 3-ей двери
            BlDoorC3.Position = NewVector(Right3, 0, 0);
            BlDoorC4 = AddCopy(BlDoorC);//установка 4-ой двери
            BlDoorC4.Position = NewVector((WidthNiche - WidthDverC1 * 2) + WidthProf + ZdviX, 0, AxisFront);
            BlDoorC5 = AddCopy(BlDoorC);//установка 5-ой двери
            BlDoorC5.Position = NewVector(Right5, 0, 0);
            BlDoorC.AnimType = AnimationType.SDoorLeft;
            BlDoorC2.AnimType = AnimationType.SDoorRight;
            BlDoorC3.AnimType = AnimationType.SDoorLeft;
            BlDoorC4.AnimType = AnimationType.SDoorRight;
            BlDoorC5.AnimType = AnimationType.SDoorRight;
            BlDoorC2.Build();
            BlDoorC3.Build();
            BlDoorC4.Build();
            BlDoorC5.Build();
            break
    }
}

function DverC()
{
    BlDoorC = BeginBlock("Дверь купе")
    ProfCL = AddExtrusion(); //профиль ручка асимметричный левый
    ProfCL.MaterialName = MaterialProf;
    ProfCL.MaterialWidth = WidthProf;
    File = CutProf;
    ProfCL.Contour.Load(File);
    ProfCL.Rotate(AxisX, -90);
    ProfCL.Thickness = HeightProf;
    ProfCL.Position = NewVector(Left, Bottom + 10, ZdvigProfCback);
    ProfCL.Name = "Профиль ручка";
    ProfCR = AddExtrusion(); //профиль ручка асимметричный правый
    ProfCR.MaterialName = MaterialProf;
    ProfCR.MaterialWidth = WidthProf;
    File = CutProf;
    ProfCR.Contour.Load(File);
    ProfCR.Contour.Symmetry(0, 0, 0, 1, false);
    ProfCR.Rotate(AxisX, -90);
    ProfCR.Thickness = HeightProf;
    ProfCR.Position = NewVector(WidthDverC1 + Left, Bottom + 10, ZdvigProfCback);
    ProfCR.Name = "Профиль ручка";
    ProfBot = AddExtrusion(); //профиль нижний
    ProfBot.MaterialName = "Рамка нижняя " + ColorProf.Value;
    ProfBot.MaterialWidth = HeightProfBot;
    File = 'Профиль нижний.frw';
    ProfBot.Contour.Load(File);
    ProfBot.Rotate(AxisY, 90);
    ProfBot.Thickness = LengthProfRam1;
    ProfBot.Position = NewVector(LeftRam, Bottom + 10, ZdvigRamckaCback)
    ProfBot.Name = "Профиль нижний";
    ProfTop = AddExtrusion(); //профиль верхний
    ProfTop.MaterialName = "Рамка верхняя " + ColorProf.Value;
    ProfTop.MaterialWidth = HeightProfTop;
    File = 'Профиль верхний.frw';
    ProfTop.Contour.Load(File);
    ProfTop.Rotate(AxisY, 90);
    ProfTop.Thickness = LengthProfRam1;
    ProfTop.Position = NewVector(LeftRam, Top - 30, ZdvigRamckaCback)
    ProfTop.Name = "Профиль верхний";

    PosY1 = Razbotton;
    PosY2 = Razbotton;
    //профиль разделительный
    for (var k = 1; k < Count; k++)
    {
        PosY1 += Section;
        ProfRazd = AddExtrusion();
        ProfRazd.MaterialName = "Рамка средняя " + ColorProf.Value;
        ProfRazd.MaterialWidth = HeightProfTop;
        File = 'Профиль разделительный.frw';
        ProfRazd.Contour.Load(File);
        ProfRazd.Rotate(AxisY, 90);
        ProfRazd.Thickness = LengthProfRam1;
        ProfRazd.Position = NewVector(LeftRam, PosY1, ZdvigRamckaCback)
        ProfRazd.Name = "Профиль средний";
        PosY1 += HeightProfCentr;
    }
    //установка наполнения
    for (var k = 0; k < Count; k++)
    {
        PosY2;
        ActiveMaterial.Make('ДСП EGGER 10 мм', 10);
        Ydsp1 = (SectionRaz - (Section + HeightProfCentr) * (Count - 1)) + 8
        Ydsp = Math.floor(Ydsp1);
        DSP = AddFrontPanel(LeftDsp, PosY2 - 8, RightDsp, Ydsp + PosY2, DspProfCback);
        DSP.TextureOrientation = ftoVertical;
        DSP.Name = "Панель двери"
        PosY2 = Section + HeightProfCentr + PosY2;
     }
    EndBlock();
    BlDoorC.Build();
}

PR()
Raschet();
MakeNap();
MakeDoors();
SetCamera(p3dFront);
Action.Continue();