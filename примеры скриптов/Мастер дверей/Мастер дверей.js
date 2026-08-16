thick = ActiveMaterial.Thickness;

NicheWidth = 1000;
NicheHeight = 2000;
NicheDepth = 500;

LeftPanel = AddVertPanel(0, thick, NicheDepth, NicheHeight - thick, 0);
RightPanel = AddVertPanel(0, thick, NicheDepth, NicheHeight - thick, NicheWidth - thick);
TopPanel = AddHorizPanel(0, 0, NicheWidth, NicheDepth, NicheHeight - thick);
BottomPanel = AddHorizPanel(0, 0, NicheWidth, NicheDepth, 0);

DoorsMaker = NewDoorsMaker();
DoorsMaker.ShowErrors = false;
if (DoorsMaker.Load('Мастер дверей.settings'))
    DoorsMaker.Silent = true;
DoorsMaker.Setup(LeftPanel, RightPanel, TopPanel, BottomPanel);
DoorsMaker.Save('Мастер дверей.settings')

Action.Commit();
ViewAll();