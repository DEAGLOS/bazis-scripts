Word = NewCOMObject('Word.Application');
y = Word.Documents;
z = y.Add();
Word.Visible = true;
Word.Selection.TypeText('Bazis\n');
Action.Continue();

NewButtonInput("Закончить").OnChange = function() {
    Action.Finish();
}

NewButtonInput("Записать панели").OnChange = function() {
    Model.forEachPanel(
        function(Obj) {
            var Line = [];
            Line.push(Obj.Name);
            Line.push(Obj.ArtPos);
            Line.push(Obj.ContourWidth);
            Line.push(Obj.ContourHeight);
            Butt = 'нет кромок';
            if (Obj.Butts && (Obj.Butts.Count))
                Butt = Obj.Butts.Count + ' кромки';
            Line.push(Butt);
            Word.Selection.TypeText(Line.join(';') + '\n');
        });
}

Action.OnFinish = function() {
    Word.Quit(false);
}