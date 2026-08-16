Butt = Action.Properties.NewButt('Кромка');
Btn = Butt.NewButton('Накатать').OnClick = function() {
    Model.forEachPanel(
        function(Obj) {
            if (Obj.Butts.Count === 0) {
                for (var i = 0; i < Obj.Contour.Count; i++) {
                    if (Obj.IsButtVisible(i, 5)) {
                        StartEditing(Obj)
                        Obj.AddButt(Butt, i);
                    }
                }
            }
        })
    Action.Finish();
}
Action.Continue();