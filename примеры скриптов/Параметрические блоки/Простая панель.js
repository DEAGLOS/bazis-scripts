// зададим параметры
Prop = Action.Properties;
w = Prop.NewNumber('Ўирина', 200);
h = Prop.NewNumber('¬ысота', 300);

// поставим кнопку завершени€ редактировани€
Prop.NewButton('«акончить').OnClick = function() {
  Action.Finish();
}

// перестраиваем панель при изменении свойства
Prop.OnChange = function() {
    DeleteNewObjects(); // очистим область скрипта
    BeginParametricBlock("ѕараметрическа€ панель"); // и создадим параметрический блок
    AddFrontPanel(0, 0, w.Value, h.Value, 0);
    EndParametricBlock();  // закончим создание блока
}

// построим панель при запуске скрипта
Prop.OnChange();
// и ждем завершени€ редактировани€
Action.Continue();