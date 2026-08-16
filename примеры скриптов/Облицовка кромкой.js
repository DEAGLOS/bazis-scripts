Materials = [];
PanelByMaterial = [];
var PanelChanged = 0;

Model.forEachPanel(
    function(Obj) {
        var MtName = Obj.MaterialName;
        var Index = Materials.indexOf(MtName);
        if (Index < 0) {
            Index = Materials.push(MtName) - 1;
            var Panels = [];
            PanelByMaterial.push(Panels);
        }
        PanelByMaterial[Index].push(Obj);
    });

len = Materials.length;
system.log(len);
for (var i = 0; i < len; ++i) {
    var Gr = Action.Properties.NewCombo(Materials[i], 'На видимые\nНа все\nУдалить');
    Gr.NewButt('Кромка');
    BtnPanSel = Gr.NewSelector('Панелей', PanelByMaterial[i].length + ' шт');
    BtnPanSel.Tag = i;
    BtnPanSel.OnClick = function(Sel) {
        UnSelectAll();
        var Panels = PanelByMaterial[Sel.Tag];
        var len = Panels.length;
        for (var j = 0; j < len; ++j) {
            Panels[j].Selected = true;
        }
    };

    BtnMake = Gr.NewButton('Применить');
    BtnMake.Tag = i;
    BtnMake.OnClick = function(Sel) {
        UnSelectAll();
        var Panels = PanelByMaterial[Sel.Tag];
        var Gr = Action.Properties.Items[Sel.Tag];
        CurAction = Gr.ItemIndex;
        var Butt = Gr.Items[0];
        plen = Panels.length;
        system.log('make butts: ' + plen);
        for (var j = 0; j < plen; ++j) {
          if (MakeButts(Panels[j], CurAction, Butt))
            PanelChanged++;
        }
        Action.Hint = 'отредактировано панелей: ' + PanelChanged;
        Action.Commit();
    };
}

NewButtonInput("Закончить").OnChange = function() { Action.Finish() };
NewButtonInput("Снять выделение").OnChange = function() { UnSelectAll() };

function MakeButts(Panel, Action, Butt) {
    var res = false;
    system.log('Panel: ' + Panel.Name);
    if (Action < 2 ) {
        if (Panel.Butts.Count === 0) {
            for (var i = 0; i < Panel.Contour.Count; i++) {
                if  ((Action == 1) || (Panel.IsButtVisible(i, 5))) {
                    system.log('Editing panel butt ' + i);
                    StartEditing(Panel);
                    Panel.AddButt(Butt, i);
                    res = true;
                }
            }
        }
    }
    if (Action == 2) {
        if (Panel.Butts.Count > 0) {
          StartEditing(Panel);
          Panel.Butts.Clear();
          res = true;
        }
    }
    return res;
}

Action.Continue();