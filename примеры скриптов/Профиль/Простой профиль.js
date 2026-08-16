Ext = AddExtrusion('name');
if (Ext.MaterialWidth == 0) {
    // установим ширину материала профиля, иначе он не будет уитываться в смете
    Ext.MaterialWidth = 100;
}
// выталкиваемый профиль
Ext.Contour.AddRectangle(0, 0, -50, 100);
// вытянем профиль вдоль оси X
Ext.Orient(AxisX, AxisY);
// установим длину профиля
Ext.Thickness = 250;