thick = ActiveMaterial.Thickness;

NicheWidth = 500;
NicheHeight = 700;
NicheDepth = 500;

LeftPanel = AddVertPanel(0, thick, NicheDepth, NicheHeight - thick, 0);
RightPanel = AddVertPanel(0, thick, NicheDepth, NicheHeight - thick, NicheWidth - thick);
TopPanel = AddHorizPanel(0, 0, NicheWidth, NicheDepth, NicheHeight - thick);
BottomPanel = AddHorizPanel(0, 0, NicheWidth, NicheDepth, 0);

BoxesMaker = NewBoxesMaker();
BoxesMaker.ShowErrors = false;
BoxesMaker.Load('Мастер ящиков.settings');
BoxesMaker.Setup(LeftPanel, RightPanel, TopPanel, BottomPanel);
BoxesMaker.Save('Мастер ящиков.settings')

Action.Commit();
ViewAll();