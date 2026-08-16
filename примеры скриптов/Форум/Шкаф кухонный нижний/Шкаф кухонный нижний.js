FileOptions = 'Настройки.xml';

MakeProperties();

Action.Properties.Load(FileOptions);
Action.OnFinish = function() {
  Action.Properties.Save(FileOptions);
}

BtnMake = NewButtonInput('Закончить');
BtnMake.OnChange = function() {
  Make(); //Вызываем функцию построения всех панелей
  Action.Finish();
}

Make();

Action.Continue();

function MakeProperties() {
  //Создание и заполнение окна свойств
  Prop = Action.Properties;
  Image = Prop.NewImage('Схема изделия', 'Схема.wmf');
  Image.MaxHeight = 250;
  Dl = Prop.NewNumber('Ширина', 500);
  Gl = Prop.NewNumber('Глубина', 400);
  H = Prop.NewNumber('Высота', 700);
  Hd = Prop.NewNumber('Размер до дна', 50);
  //Fas = Prop.NewNumber('Размер фаски', 50);
  Korpus = Prop.NewGroup('Корпус')
  MatKorp = Korpus.NewMaterial('Материал корпуса');
  KrVidimKorp = Korpus.NewButt('Видимая кромка');
  KrNotVidimKorp = Korpus.NewButt('Невидимая кромка');
  
  Polki = Prop.NewGroup('Полки');
  KolPolok = Polki.NewNumber('Количество полок', 2);
  OtstPol = Polki.NewNumber('Отступ от Лев/Пр боковины', 2);
  OtstPered = Polki.NewNumber('Отступ от переда', 20);
  OtstZad = Polki.NewNumber('Отступ от зада', 0);
  PolkD= Polki.NewNumber('Количество полкодерж ', 4);
  PolkMinRasst= Polki.NewNumber('Мин расст от низа/верха', 208);
  //kolPolok.value=1;
  
  ZadnStenka = Prop.NewGroup('Задняя стенка');
  MatZadnStenka = ZadnStenka.NewMaterial('Материал');
  //KD=1;
  Dver = Prop.NewGroup('Дверь');
  KolDver = Dver.NewNumber('Количество дверей', 1);
  //if (KD > 2)
  //{
  //alert ('Введите число не более 2’);
  //KD=1;
  //}
  //KolDver = KD
  
  MatDver = Dver.NewMaterial('Материал');
  KrDver = Dver.NewButt('Кромка');
  Petli = Dver.NewFurniture('Петля');
  Freza = Dver.NewSelector('Профиль фрезы');
  TipFilenki = Dver.NewCombo('Тип филенки',  'Тип1\nТип2\nТип3\nТип4');
  Freza.OnClick = function() {
    Freza.Value = system.askFileName('frw');
  };

  OtstupFil = Dver.NewNumber('Отступ филенки от края', 80);
  Rad = Dver.NewNumber('Радиус сопряжений', 80);

  OkBtn = Prop.NewButton('Построить');
  //Обработка нажатия на кнопку Построить
  OkBtn.OnClick = function() {
    Make(); //Вызываем функцию построения всех панелей
    Action.Finish();
  }

  //Обработка любого изменения значений свойств
  Prop.OnChange = function() {
    //if (Fas.Value > Hd.Value) alert('Предупреждение! Фаска больше чем высота дна.')
    
    Make(); //Вызываем функцию построения всех панелей
  };
}

function Make() {
  //Удаление старых объектов из области скрипта
  DeleteNewObjects();
  //Определяем толщину задней стенки для правильного формирования толщины паза
  MatZadnStenka.SetActive();
  ThickZadSt = ActiveMaterial.Thickness;

  MatKorp.SetActive();
  //Считываем толщину текущего материала
  Thick = ActiveMaterial.Thickness;

  //Krishka = AddHorizPanel(0, 0, Dl.Value, Gl.Value, H.Value - Thick);
  //Присваиваем панели имя
  //Krishka.Name = 'Крышка';
  //Krishka.AddButt(KrNotVidimKorp, 0);
  //Krishka.AddButt(KrVidimKorp, 1);
  //Krishka.AddButt(KrVidimKorp, 2);
  //Krishka.AddButt(KrVidimKorp, 3);
  //Стоим паз
  //Cut = Krishka.Cuts.Add();
  //Traj = Cut.Trajectory;
  //Traj.AddLine(0, -10, Dl.Value, -10);
  //ContPaz = Cut.Contour;
  //ContPaz.AddRectangle(0, 0, -ThickZadSt - 0.5, 10);
  //Krishka.Build();
//Ставим левый бок,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  LevBok = AddVertPanel(0, Hd.Value+ Thick, Gl.Value, H.Value , 0);
  //Присваиваем панели имя
  LevBok.Name = 'Боковина левая';
  //LevBok.Contour.Facet(0, 0, Fas.Value);
  LevBok.AddButt(KrNotVidimKorp, 0);
  LevBok.AddButt(KrVidimKorp, 1);
    LevBok.AddButt(KrNotVidimKorp, 2)
  //LevBok.AddButt(KrNotVidimKorp, 3);
  LevBok.AddButt(KrNotVidimKorp, 4);
  //Cut = LevBok.Cuts.Add();
  //Traj = Cut.Trajectory;
  //Traj.AddLine(10, 0, 10, H.Value - Thick);
  //ContPaz = Cut.Contour;
  //ContPaz.AddRectangle(0, 0, -ThickZadSt - 0.5, 10);
  LevBok.Build();
//Ставим правый бок,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  PravBok = AddSymmetry(LevBok, NewVector(Dl.Value / 2, 0, 0), AxisX);
  //Присваиваем панели имя
  PravBok.Name = 'Боковина правая';

  
  

 //Ставим дно...............................................................................
 Dno = AddHorizPanel(0, 0, Dl.Value , Gl.Value, Hd.Value);
 
  //Присваиваем панели имя
  Dno.Name = 'Дно';
  Dno.AddButt(KrNotVidimKorp, 0);
  //    Dno.AddButt(KrVidimKorp, 1);
  Dno.AddButt(KrVidimKorp, 2)
  //    Dno.AddButt(KrVidimKorp, 3);
  //Cut = Dno.Cuts.Add();
  //Traj = Cut.Trajectory;
  //Traj.AddLine(0, -10, Dl.Value - Thick, -10);
  //ContPaz = Cut.Contour;
  //ContPaz.AddRectangle(0, Thick, -ThickZadSt - 0.5, Thick - 10);
  Dno.Build();
  

//Ставим цоколь,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  Cokol = AddFrontPanel(0, 5, Dl.Value , Hd.Value, Gl.Value - 10 - Thick);
  //Присваиваем панели имя
  Cokol.Name = 'Цоколь';
  Cokol.AddButt(KrNotVidimKorp, 0);
  Cokol.AddButt(KrNotVidimKorp, 1);
  Cokol.AddButt(KrNotVidimKorp, 2);
  Cokol.AddButt(KrNotVidimKorp, 3);
  Cokol.Build();
  //......................................................
//Вычисляем монтажную планку
  KolShag=Gl.Value / 32^ 0
  ShMontPl=(Gl.Value-KolShag*32);
  if (ShMontPl < 84)
  {
    while (ShMontPl<84)
        {
        KolShag=KolShag-1;
        ShMontPl=(Gl.Value-KolShag*32);
        }
  }
  
    //.....................................................................
  //Вычисляем кол-во полкодержателей
   KolPolkDer = PolkD.Value;
  // alert('kol polkod'+KolPolkDer);
  //alert(KolPolkDer.value);
  ShagPolkDer=96;
  RasstMegduKrPolk = (H.Value - Hd.Value- Thick- (KolPolkDer-1)*ShagPolkDer)/2;
  //Кому не надо сообщение закомментируйте строку
  alert('Количество полкодержателей  '+' '+ KolPolkDer+' ' + 'Расстояние от края  ' + ' '+ RasstMegduKrPolk);
  //..............................................
  //Устанавливаем ширину отступа от переда-зада для фурнитуры
  Dz = Gl.Value - ShMontPl/2;
  Dz1 = Gl.Value -Gl.Value + ShMontPl/2;
  //....................................................
 // if(KolPolkDer = 0)
 // {
 // Sdvig=(H.Value - Thick - Hd.Value - Thick - KolPolok.Value*Thick)  / (KolPolok.Value + 1);
  //}
  //else
  //{
  Sdvig =RasstMegduKrPolk;
  //}
  //Sdvig=(H.Value - Thick - Hd.Value - Thick - KolPolok.Value*Thick)  / (KolPolok.Value + 1);
  Hp = Hd.Value+ Thick  ;
  HPol = Hp + Sdvig;
  //alert(HPol);
  for (var k = 0; k < KolPolkDer; k++)
  {
  OtvPolk = OpenFurniture('5x9.f3d');
                    OtvPolk.Mount1(LevBok, Thick, HPol, Dz, 0);
                    OtvPolk.Mount1(LevBok, Thick, HPol, Dz1, 0);
                     OtvPolk.Mount1(PravBok, Thick, HPol, Dz, 0);
                    OtvPolk.Mount1(PravBok, Thick, HPol, Dz1, 0);
                    HPol += ShagPolkDer
 
  }
  HPolki = Hp + Sdvig;
  for (var i = 0; i < KolPolok.Value; i++)
  {
  Polka = AddHorizPanel(Thick + OtstPol.Value, OtstZad.Value , Dl.Value - Thick - OtstPol.Value, Gl.Value - OtstPered.Value, HPolki+2.5);
                    Polka.Name = 'Полка';
                    Polka.AddButt(KrNotVidimKorp, 0);
                    Polka.AddButt(KrNotVidimKorp, 1);
                    Polka.AddButt(KrVidimKorp, 2);
                    Polka.AddButt(KrNotVidimKorp, 3);
                    Polka.Build();
                    Polkodergatel = OpenFurniture('Полкодержатель.f3d');
                    Polkodergatel.Mount(Polka, LevBok, 2 * Thick, HPolki, Dz);
                    Polkodergatel.Mount(Polka, LevBok, 2 * Thick, HPolki, Dz1);
                    Polkodergatel.Mount(Polka, PravBok, 2 * Thick, HPolki, Dz);
                    Polkodergatel.Mount(Polka, PravBok, 2 * Thick, HPolki, Dz1);
  HPolki+=ShagPolkDer;
  }
//Ставим монтажные планки,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  MontPlZad = AddHorizPanel(Thick,Gl.Value-Gl.Value, Dl.Value- Thick,ShMontPl, H.Value- Thick );
  //Присваиваем панели имя
  MontPlZad.Name = 'Монт пл зад';
   //MontPlZad.AddButt(KrNotVidimKorp, 0);
  MontPlZad.AddButt(KrVidimKorp, 2);
   MontPlZad.Build();
   
   MontPlPer = AddHorizPanel(Thick,Gl.Value-ShMontPl, Dl.Value- Thick,Gl.Value, H.Value- Thick );
  //Присваиваем панели имя
  MontPlPer.Name = 'Монт пл пер';
  MontPlPer.AddButt(KrNotVidimKorp, 2);
  MontPlPer.AddButt(KrVidimKorp, 0);
   MontPlPer.Build();
//,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,  
//Ставим заднюю стенку,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  MatZadnStenka.SetActive();
  ZadnStenka = AddFrontPanel(2, Hd.Value + 2,
    Dl.Value - 2, H.Value - 2, 0-ThickZadSt);
  //Присваиваем панели имя
  ZadnStenka.Name = 'Задняя стенка';
  ZadnStenka.Build();
  //,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  //Ставим двери,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  KolD=KolDver.Value * 1;
  
  if (KolD==1)
  {
     Block = BeginBlock("Дверь")
    MatDver.SetActive();
    ThickDver = ActiveMaterial.Thickness;
    Dver = AddFrontPanel(2, Hd.Value + 2, Dl.Value - 2, H.Value - 2, Gl.Value);
    //Присваиваем панели имя
    Dver.Name = 'Дверь';
    for (var k = 0; k < 4; k++) {
      Dver.AddButt(KrDver, k)
    }
    Rucka = OpenFurniture('Ручка-скоба 128 UN47_128.f3d');
    Rucka.Mount1(Dver, Dl.Value - 2 - 40, H.Value - 115, Gl.Value + ThickDver, 0);

 
  FPetli = Petli.Value;
  Block.AnimType = AnimationType.DoorLeft;
  Ost = (Dver.GSize.y - 200) % 32 //Остаток от деления высоты двери - 200 на 32
  k = (Dver.GSize.y - 200 - Ost) / 32 // Сколько раз укладывается размер 32
  Dy = (Dver.GSize.y - k * 32) * 0.5 //Смещение пели от низа или верха двери
  FPetli.Mount(LevBok, Dver, 2 * Thick, Dver.PositionY + Dy, 0);
  FPetli.Mount(LevBok, Dver, 2 * Thick, Dver.PositionY + Dy + k * 32, 0);
  }
  else
  {
      Block = BeginBlock("Дверь")
      
    MatDver.SetActive();
    ThickDver = ActiveMaterial.Thickness;
    Dver = AddFrontPanel(2, Hd.Value + 2, Dl.Value /2- 2, H.Value - 2, Gl.Value);
    //Присваиваем панели имя
    Dver.Name = 'Дверь1';
    for (var k = 0; k < 4; k++) {
      Dver.AddButt(KrDver, k)
    }
    Rucka = OpenFurniture('Ручка-скоба 128 UN47_128.f3d');
    Rucka.Mount1(Dver, Dl.Value /2 - 42, H.Value - 115, Gl.Value + ThickDver, 0);

 
  FPetli = Petli.Value;
  Block.AnimType = AnimationType.DoorLeft;
  Ost = (Dver.GSize.y - 200) % 32 //Остаток от деления высоты двери - 200 на 32
  k = (Dver.GSize.y - 200 - Ost) / 32 // Сколько раз укладывается размер 32
  Dy = (Dver.GSize.y - k * 32) * 0.5 //Смещение пели от низа или верха двери
  FPetli.Mount(LevBok, Dver, 2 * Thick, Dver.PositionY + Dy, 0);
  FPetli.Mount(LevBok, Dver, 2 * Thick, Dver.PositionY + Dy + k * 32, 0);
 MatDver.SetActive();
 
    ThickDver = ActiveMaterial.Thickness;
    
    
    Dver1 = AddFrontPanel(Dl.Value /2+ 2, Hd.Value + 2, Dl.Value- 2, H.Value - 2, Gl.Value);
    //Присваиваем панели имя
    Dver.Name = 'Дверь2';
    for (var k = 0; k < 4; k++) {
      Dver.AddButt(KrDver, k)
    }
    Rucka = OpenFurniture('Ручка-скоба 128 UN47_128.f3d');
    Rucka.Mount1(Dver, Dl.Value /2+ 42, H.Value - 115, Gl.Value + ThickDver, 0);

 //alert ('Ручка-скоба 128 UN47_128.f3d');
  FPetli = Petli.Value;
  Block.AnimType = AnimationType.DoorLeft;
  Ost = (Dver.GSize.y - 200) % 32 //Остаток от деления высоты двери - 200 на 32
  k = (Dver.GSize.y - 200 - Ost) / 32 // Сколько раз укладывается размер 32
  Dy = (Dver.GSize.y - k * 32) * 0.5 //Смещение пели от низа или верха двери
  FPetli.Mount(LevBok, Dver, 2 * Thick, Dver.PositionY + Dy, 0);
  FPetli.Mount(LevBok, Dver, 2 * Thick, Dver.PositionY + Dy + k * 32, 0);
  }
  
  //Block = BeginBlock("Дверь")
  //  MatDver.SetActive();
  //  ThickDver = ActiveMaterial.Thickness;
  //  Dver = AddFrontPanel(2, Hd.Value + 2, Dl.Value - 2, H.Value - 2, Gl.Value);
    //Присваиваем панели имя
 //   Dver.Name = 'Дверь';
  //  for (var k = 0; k < 4; k++) {
 //     Dver.AddButt(KrDver, k)
 //   }
 //   Rucka = OpenFurniture('Ручка-скоба 128 UN47_128.f3d');
 //   Rucka.Mount1(Dver, Dl.Value - 2 - 40, H.Value - 115, Gl.Value + ThickDver, 0);

 
//  FPetli = Petli.Value;
//  Block.AnimType = AnimationType.DoorLeft;
 // Ost = (Dver.GSize.y - 200) % 32 //Остаток от деления высоты двери - 200 на 32
 // k = (Dver.GSize.y - 200 - Ost) / 32 // Сколько раз укладывается размер 32
 // Dy = (Dver.GSize.y - k * 32) * 0.5 //Смещение пели от низа или верха двери
 // FPetli.Mount(LevBok, Dver, 2 * Thick, Dver.PositionY + Dy, 0);
//  FPetli.Mount(LevBok, Dver, 2 * Thick, Dver.PositionY + Dy + k * 32, 0);




//Евровинт 6х50.f3d
  Evrovint = OpenFurniture('Евровинт 6х50.f3d');
  Evrovint.Mount(LevBok, Dno,  Thick/2, Hd.Value, Dz);
  Evrovint.Mount(LevBok, Dno,  Thick/2, Hd.Value, Dz1);
  Evrovint.Mount(PravBok, Dno,Dl.Value-  Thick/2, Hd.Value, Dz);
  Evrovint.Mount(PravBok, Dno,Dl.Value-  Thick/2, Hd.Value, Dz1);
  Evrovint.Mount(MontPlZad, LevBok,  Thick/2, Hd.Value, Dz);
  Evrovint.Mount(MontPlZad, LevBok,  Thick/2, Hd.Value, Dz1);
  Evrovint.Mount(MontPlPer, PravBok,Dl.Value-  Thick/2, Hd.Value, Dz);
  Evrovint.Mount(MontPlPer, PravBok,Dl.Value-  Thick/2, Hd.Value, Dz1);
  
  //Опора регулируемая 100..125 в сборе.f3d
  
Lag = OpenFurniture('Опора регулируемая 100..125 в сборе.f3d');



// ножки на горизонтальные

Lag.Mount1(Dno, 53, -50, Gl.Value-53, 0);
Lag.Mount1(Dno, Dl.Value -53, -50, Gl.Value-53, 0);
Lag.Mount1(Dno, Dl.Value -53, -50, 53, 0);
Lag.Mount1(Dno, 53, -50, 53, 0);

Samorez = OpenFurniture('Шуруп 4х30.f3d');
Samorez.Mount1(MontPlPer, Dl.Value-Dl.Value+100, H.Value - Thick, Gl.Value -ShMontPl/2, 0);
Samorez.Mount1(MontPlPer, Dl.Value-100, H.Value - Thick, Gl.Value -ShMontPl/2, 0);
Samorez.Mount1(MontPlZad, Dl.Value-Dl.Value+100, H.Value - Thick, Gl.Value-Gl.Value +ShMontPl/2, 0);
Samorez.Mount1(MontPlZad, Dl.Value-100, H.Value - Thick, Gl.Value-Gl.Value +ShMontPl/2, 0);
//Ставим гвозди,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
//Шаг установки гвоздя,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
ShagGvozd = 150; 
//,,,,,,,,,,,,,,,,,,,,,,,,,,, 
Gvozd = OpenFurniture('Гвоздь 1х16.f3d');
X=Dl.Value/2-ShagGvozd/2;
 for (k=Dl.Value/2+ShagGvozd/2;k<Dl.Value;k++)
 {
 Gvozd.Mount(Dno,ZadnStenka,   X, Hd.Value+Thick, Gl.Value-Gl.Value-ThickZadSt);
 Gvozd.Mount(Dno,ZadnStenka,   k, Hd.Value+Thick, Gl.Value-Gl.Value-ThickZadSt);
  Gvozd.Mount(MontPlZad,ZadnStenka,   X, H.Value-Thick, Gl.Value-Gl.Value-ThickZadSt);
 Gvozd.Mount(MontPlZad,ZadnStenka,   k, H.Value-Thick, Gl.Value-Gl.Value-ThickZadSt);
 k+=ShagGvozd;
 X+=-ShagGvozd;
 }
 Y=(H.Value-Hd.Value)/2-ShagGvozd/2;
 for (k=(H.Value-Hd.Value)/2+ShagGvozd/2;k<H.Value;k++)
 {
 Gvozd.Mount(LevBok,ZadnStenka,  Dl.Value -Dl.Value +Thick/2, Y,  Gl.Value-Gl.Value-ThickZadSt);
 Gvozd.Mount(LevBok,ZadnStenka,  Dl.Value -Dl.Value +Thick/2, k, Gl.Value-Gl.Value-ThickZadSt);
  Gvozd.Mount(PravBok,ZadnStenka,  Dl.Value -Thick/2, Y,  Gl.Value-Gl.Value-ThickZadSt);
 Gvozd.Mount(PravBok,ZadnStenka,  Dl.Value -Thick/2, k, Gl.Value-Gl.Value-ThickZadSt);
 k+=ShagGvozd;
 X+=-ShagGvozd;
 
 }
}
