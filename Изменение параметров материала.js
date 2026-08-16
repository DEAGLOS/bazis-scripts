/**
 * Изменение параметров материала в панели свойств
 * Плитные материалы + облицовки пласти
 * Кромка
 * Профиль
 * Фурнитура
 * Создано в версии: 2021.11.1.3294
 */

function updateList() {

    panelMaterial = []
    panelMaterialKeys = []
    buttMaterial = []
    buttMaterialKeys = []
    profileMaterial = []
    profileMaterialKeys = []
    furnMaterial = []
    furnMaterialKeys = []

    Model.forEachPanel(function (panel) {
        let name = ExtractMatName(panel.MaterialName)
        let art = ExtractMatCode(panel.MaterialName)
        let key = name + " (арт: " + art + ")"
        let param = {
            "name": name,
            "art": art,
            "key": key
        }
        if (panelMaterialKeys.indexOf(key) < 0) {
            panelMaterialKeys.push(key)
            panelMaterial.push(param)
        }

        for (let i = 0; i < panel.Plastics.Count; i++) {
            let name = ExtractMatName(panel.Plastics[i].Material)
            let art = ExtractMatCode(panel.Plastics[i].Material)
            let key = name + " (арт: " + art + ")"
            let param = {
                "name": name,
                "art": art,
                "key": key
            }
            if (panelMaterialKeys.indexOf(key) < 0) {
                panelMaterialKeys.push(key)
                panelMaterial.push(param)
            }
        }

        for (let i = 0; i < panel.Butts.Count; i++) {
            let name = ExtractMatName(panel.Butts[i].Material)
            let art = ExtractMatCode(panel.Butts[i].Material)
            let sign = panel.Butts.Butts[i].Sign
            let thickness = panel.Butts.Butts[i].Thickness
            let width = panel.Butts.Butts[i].Width
            let key = name + " (арт: " + art + ")"
            let param = {
                "name": name,
                "art": art,
                "sign": sign,
                "thickness": thickness,
                "width": width,
                "key": key
            }

            if (buttMaterialKeys.indexOf(key) < 0) {
                buttMaterialKeys.push(key)
                buttMaterial.push(param)
            }
        }
    })

    Model.forEach(function (obj) {
        if (obj instanceof TExtrusionBody || obj instanceof T2DTrajectoryBody){
            let name = ExtractMatName(obj.MaterialName)
            let art = ExtractMatCode(obj.MaterialName)
            let key = name + " (арт: " + art + ")"
            let param = {
                "name": name,
                "art": art,
                "key": key
            }
            if (profileMaterialKeys.indexOf(key) < 0) {
                profileMaterialKeys.push(key)
                profileMaterial.push(param)
            }
        }

        if (obj instanceof TFastener){
            let name = ExtractMatName(obj.Name)
            let art = ExtractMatCode(obj.Name)
            let key = name + " (арт: " + art + ")"
            let param = {
                "name": name,
                "art": art,
                "key": key
            }
            if (furnMaterialKeys.indexOf(key) < 0) {
                furnMaterialKeys.push(key)
                furnMaterial.push(param)
            }
        }
    })

}
function sortOutButt(panel) {
    for (let i = 0; i < panel.Butts.Count; i++) {
        let mat = ExtractMatName(panel.Butts[i].Material) + ExtractMatCode(panel.Butts[i].Material)
        if (mat === oldButtMaterialName + oldButtMaterialArt) {
            panel.Butts[i].Material = ButtMaterialName.Value + "\r" + ButtMaterialArt.Value
            panel.Butts[i].Sign = ButtMaterialSign.Value
            panel.Butts[i].Thickness = ButtMaterialThickness.Value
            panel.Butts[i].Width = ButtMaterialWidth.Value
        }
    }
}
function sortOutPlastic(panel) {
    for (let i = 0; i < panel.Plastics.Count; i++) {
        let mat = ExtractMatName(panel.Plastics[i].Material) + ExtractMatCode(panel.Plastics[i].Material)
        if (mat === oldPanelMaterialName + oldPanelMaterialArt) {
            panel.Plastics[i].Material = PanelMaterialName.Value + "\r" + PanelMaterialArt.Value
        }
    }
}
function replacePanel() {
    if (ReplaceCondition.Value === "Заменять на всех") {
        Model.forEachPanel(function (panel) {
            let mat = ExtractMatName(panel.MaterialName) + ExtractMatCode(panel.MaterialName)
            if (mat === oldPanelMaterialName + oldPanelMaterialArt) {
                panel.MaterialName = PanelMaterialName.Value + "\r" + PanelMaterialArt.Value
            }
            sortOutPlastic(panel)
        })
        alert("Параметры материала изменены!")
        updateList()
        PanelMaterial.Value = "Выбрать плиту..."
        PanelMaterial.ComboItems = panelMaterialKeys
    } else if (ReplaceCondition.Value === "Заменять на выделенных") {
        Model.forEachPanel(function (panel) {
            if (panel.Selected === true) {
                let mat = ExtractMatName(panel.MaterialName) + ExtractMatCode(panel.MaterialName)
                if (mat === oldPanelMaterialName + oldPanelMaterialArt) {
                    panel.MaterialName = PanelMaterialName.Value + "\r" + PanelMaterialArt.Value
                }
                sortOutPlastic(panel)
            }
        })
        alert("Параметры материала изменены!")
        updateList()
        PanelMaterial.Value = "Выбрать плиту..."
        PanelMaterial.ComboItems = panelMaterialKeys
    }
    Action.Commit()
}
function replaceButt() {
    if (ReplaceCondition.Value === "Заменять на всех") {
        Model.forEachPanel(function (panel) {
            sortOutButt(panel)
        })
        alert("Параметры материала изменены!")
        updateList()
        ButtMaterial.Value = "Выбрать кромку..."
        ButtMaterial.ComboItems = buttMaterialKeys
    } else if (ReplaceCondition.Value === "Заменять на выделенных") {
        Model.forEachPanel(function (panel) {
            if (panel.Selected === true) {
                sortOutButt(panel)
            }
        })
        alert("Параметры материала изменены!")
        updateList()
        ButtMaterial.Value = "Выбрать кромку..."
        ButtMaterial.ComboItems = buttMaterialKeys
    }
    Action.Commit()
}
function replaceProfile() {
    if (ReplaceCondition.Value === "Заменять на всех") {
        Model.forEach(function (obj) {
            if (obj instanceof TExtrusionBody || obj instanceof T2DTrajectoryBody){
                let mat = ExtractMatName(obj.MaterialName) + ExtractMatCode(obj.MaterialName)
                if (mat === (oldProfileMaterialName + oldProfileMaterialArt)) {
                    obj.MaterialName = ProfileMaterialName.Value + "\r" + ProfileMaterialArt.Value
                }
            }
        })

        alert("Параметры материала изменены!")
        updateList()
        ProfileMaterial.Value = "Выбрать профиль..."
        ProfileMaterial.ComboItems = profileMaterialKeys
    } else if (ReplaceCondition.Value === "Заменять на выделенных") {
        Model.forEach(function (obj) {
            if (obj.Selected === true) {
                if (obj instanceof TExtrusionBody || obj instanceof T2DTrajectoryBody){
                    let mat = ExtractMatName(obj.MaterialName) + ExtractMatCode(obj.MaterialName)
                    if (mat === (oldProfileMaterialName + oldProfileMaterialArt)) {
                        obj.MaterialName = ProfileMaterialName.Value + "\r" + ProfileMaterialArt.Value
                    }
                }
            }
        })

        alert("Параметры материала изменены!")
        updateList()
        ProfileMaterial.Value = "Выбрать профиль..."
        ProfileMaterial.ComboItems = profileMaterialKeys
    }
    Action.Commit()
}
function replaceFurn() {
    if (ReplaceCondition.Value === "Заменять на всех") {
        Model.forEach(function (obj) {
            if (obj instanceof TFastener){
                let mat = ExtractMatName(obj.Name) + ExtractMatCode(obj.Name)
                if (mat === (oldFurnMaterialName + oldFurnMaterialArt)) {
                    obj.Name = FurnMaterialName.Value + "\r" + FurnMaterialArt.Value
                }
            }
        })

        alert("Параметры материала изменены!")
        updateList()
        FurnMaterial.Value = "Выбрать фурнитуру..."
        FurnMaterial.ComboItems = furnMaterialKeys
    } else if (ReplaceCondition.Value === "Заменять на выделенных") {
        Model.forEach(function (obj) {
            if (obj.Selected === true) {
                if (obj instanceof TFastener){
                    let mat = ExtractMatName(obj.Name) + ExtractMatCode(obj.Name)
                    if (mat === (oldFurnMaterialName + oldFurnMaterialArt)) {
                        obj.Name = FurnMaterialName.Value + "\r" + FurnMaterialArt.Value
                    }
                }
            }
        })

        alert("Параметры материала изменены!")
        updateList()
        FurnMaterial.Value = "Выбрать фурнитуру..."
        FurnMaterial.ComboItems = furnMaterialKeys
    }
    Action.Commit()
}


Undo.RecursiveChanging(Model)

let panelMaterial = []
let panelMaterialKeys = []
let buttMaterial = []
let buttMaterialKeys = []
let profileMaterial = []
let profileMaterialKeys = []
let furnMaterial = []
let furnMaterialKeys = []

let oldPanelMaterialName = ""
let oldPanelMaterialArt = ""
let oldButtMaterialName = ""
let oldButtMaterialArt = ""
let oldButtMaterialSign = ""
let oldButtMaterialThickness = ""
let oldButtMaterialWidth = ""
let oldProfileMaterialName = ""
let oldProfileMaterialArt = ""
let oldFurnMaterialName = ""
let oldFurnMaterialArt = ""


updateList()


// properties, panel создание панели свойств
Prop = Action.Properties
ReplaceCondition = Prop.NewCombo("Условия замены: ", "Заменять на всех")
ReplaceCondition.ComboItems = ["Заменять на всех панелях", "Заменять на выделенных"]

GroupPanel = Prop.NewGroup("Листовые материалы:")
GroupPanel.Expanded = false
PanelMaterial = GroupPanel.NewCombo("Текущий материал:",  "Выбрать плиту...")
PanelMaterial.ComboItems = panelMaterialKeys
PanelMaterialName = GroupPanel.NewString("Наименование:")
PanelMaterialArt = GroupPanel.NewString("Артикул:")

GroupButt = Prop.NewGroup('Кромочные материалы:')
GroupButt.Expanded = false
ButtMaterial = GroupButt.NewCombo("Текущая кромка:", "Выбрать кромку...")
ButtMaterial.ComboItems = buttMaterialKeys
ButtMaterialName = GroupButt.NewString("Наименование:")
ButtMaterialArt = GroupButt.NewString("Артикул:")
ButtMaterialSign = GroupButt.NewString("Обозначение:")
ButtMaterialThickness = GroupButt.NewNumber("Толщина:")
ButtMaterialWidth = GroupButt.NewNumber("Ширина:")

GroupProfile = Prop.NewGroup("Профиль:")
GroupProfile.Expanded = false
ProfileMaterial = GroupProfile.NewCombo("Текущий профиль:",  "Выбрать профиль...")
ProfileMaterial.ComboItems = profileMaterialKeys
ProfileMaterialName = GroupProfile.NewString("Наименование:")
ProfileMaterialArt = GroupProfile.NewString("Артикул:")

GroupFurn = Prop.NewGroup("Фурнитура:")
GroupFurn.Expanded = false
FurnMaterial = GroupFurn.NewCombo("Текущая фурнитура:",  "Выбрать фурнитуру...")
FurnMaterial.ComboItems = furnMaterialKeys
FurnMaterialName = GroupFurn.NewString("Наименование:")
FurnMaterialArt = GroupFurn.NewString("Артикул:")

ButtonClose = Prop.NewButton("Завершить работу")


// events, обработка событий окна свойств
PanelMaterial.OnChange = function () {
    panelMaterial.forEach(function (elem) {
        if (elem.key === PanelMaterial.Value) {
            oldPanelMaterialName = elem.name
            oldPanelMaterialArt = elem.art
            PanelMaterialName.Value = oldPanelMaterialName
            PanelMaterialArt.Value = oldPanelMaterialArt
        }
    })
}
PanelMaterialName.OnChange = function () {
    replacePanel()
}
PanelMaterialArt.OnChange = function () {
    replacePanel()
}

ButtMaterial.OnChange = function () {
    buttMaterial.forEach(function (elem) {
        if (elem.key === ButtMaterial.Value) {
            oldButtMaterialName = elem.name
            oldButtMaterialArt = elem.art
            oldButtMaterialSign = elem.sign
            oldButtMaterialThickness = elem.thickness
            oldButtMaterialWidth = elem.width
            ButtMaterialName.Value = oldButtMaterialName
            ButtMaterialArt.Value = oldButtMaterialArt
            ButtMaterialSign.Value = oldButtMaterialSign
            ButtMaterialThickness.Value = oldButtMaterialThickness
            ButtMaterialWidth.Value = oldButtMaterialWidth
        }
    })
}
ButtMaterialName.OnChange = function () {
    replaceButt()
}
ButtMaterialArt.OnChange = function () {
    replaceButt()
}
ButtMaterialSign.OnChange = function () {
    replaceButt()
}
ButtMaterialThickness.OnChange = function () {
    replaceButt()
}
ButtMaterialWidth.OnChange = function () {
    replaceButt()
}

ProfileMaterial.OnChange = function () {
    profileMaterial.forEach(function (elem) {
        if (elem.key === ProfileMaterial.Value) {
            oldProfileMaterialName = elem.name
            oldProfileMaterialArt = elem.art
            ProfileMaterialName.Value = oldProfileMaterialName
            ProfileMaterialArt.Value = oldProfileMaterialArt
        }
    })
}
ProfileMaterialName.OnChange = function () {
    replaceProfile()
}
ProfileMaterialArt.OnChange = function () {
    replaceProfile()
}

FurnMaterial.OnChange = function () {
    furnMaterial.forEach(function (elem) {
        if (elem.key === FurnMaterial.Value) {
            oldFurnMaterialName = elem.name
            oldFurnMaterialArt = elem.art
            FurnMaterialName.Value = oldFurnMaterialName
            FurnMaterialArt.Value = oldFurnMaterialArt
        }
    })
}
FurnMaterialName.OnChange = function () {
    replaceFurn()
}
FurnMaterialArt.OnChange = function () {
    replaceFurn()
}

ButtonClose.OnClick = function () {
    Action.Finish()
}

Action.Continue()
