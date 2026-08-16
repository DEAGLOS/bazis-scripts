Width = 300; // ширина рамки
Height = 400; // высота рамки
Profile = NewContour();
Profile.AddLine(0, 0, -25, 0);
Profile.AddLine(-25, 0, 0, 50);
Profile.AddLine(0, 50, 0, 0);

Ext1 = AddExtrusion('1');
Ext1.Contour.Addition(Profile);
Ext1.Orient(AxisX, AxisY);
Ext1.Thickness = Width;
Clip45(Ext1);

Ext2 = AddExtrusion('2');
Ext2.Contour.Addition(Profile);
Ext2.Orient(AxisY, Axis_X);
Ext2.PositionX = Width;
Ext2.Thickness = Height;
Clip45(Ext2);

Ext3 = AddExtrusion('3');
Ext3.Contour.Addition(Profile);
Ext3.PositionX = Width;
Ext3.PositionY = Height;
Ext3.Orient(Axis_X, Axis_Y);
Ext3.Thickness = Width;
Clip45(Ext3);

Ext4 = AddExtrusion('4');
Ext4.Contour.Addition(Profile);
Ext4.Orient(Axis_Y, AxisX);
Ext4.PositionY = Height;
Ext4.Thickness = Height;
Clip45(Ext4);


function Clip45(Ext) {
  Ext.Clip(NewVector(0, 0, 0), NewVector(0, -1, 1));
  Ext.Clip(NewVector(0, 0, Ext.Thickness), NewVector(0, -1, -1));
}