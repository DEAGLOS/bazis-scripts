Action.Continue(); // continue action
Action.OnMove = function() {
    Obj = Action.Get3DObject();
    if (Obj.AsPanel) {
        p = Obj.ToObject(Action.Pos3);
        Hole = NewContour();
        Hole.AddCircle(p.x, p.y, 50);
        Obj.AsPanel.Contour.Subtraction(Hole);
        Obj.Build();
    }
}