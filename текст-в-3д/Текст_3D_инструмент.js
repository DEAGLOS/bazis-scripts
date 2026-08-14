// ============================================================
// —јћќ—“ќя“≈Ћ№Ќџ… »Ќ—“–”ћ≈Ќ“: объЄмный текст из готовых шрифтов
//
// —писок шрифтов читаетс€ из файла "Ўрифты.txt" (лежит р€дом,
// по одному имени на строку). ƒл€ каждого имени из списка
// читаетс€ файл "<им€>.txt" (чистый JSON, не .js - чтобы Ѕазис
// не путал шрифты со скриптами в своих списках) и парситс€ в
// FontRegistry - этому скрипту не нужно знать имена заранее.
//
// ѕ≈–¬јя строка манифеста = базовый шрифт-донор символов:
// если в выбранном шрифте нет буквы/цифры/знака - берЄтс€ оттуда
// (с масштабированием под ≈√ќ собственный эталонный размер).
//
// „тобы добавить новый шрифт клиенту:
//   1) сгенерировать <»м€Ўрифта>.txt
//   2) дописать "»м€Ўрифта" отдельной строкой в Ўрифты.txt
// Ётот файл (сам инструмент) при этом не мен€етс€ вообще.
//
//  ириллица в строковых литералах записана как \uXXXX-эскейпы -
// чистый ASCII, не зависит от того, читает ли Ѕазис файл как
// CP1251 (старые версии) или UTF-8 (новые) - работает одинаково
// в обоих случа€х без отдельных версий файла под разные Ѕазисы.
// ============================================================

var FontRegistry = {};

var fontList = system.readTextFile('\u0428\u0440\u0438\u0444\u0442\u044b.txt').split('\n');
for (var i = 0; i < fontList.length; i++) {
    var name = fontList[i].replace(/\r/g, '').replace(/^\s+|\s+$/g, '');
    if (name.length == 0) continue;
    if (system.fileExists(name + '.txt')) {
        FontRegistry[name] = JSON.parse(system.readTextFile(name + '.txt'));
    } else {
        alert('\u041d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d \u0444\u0430\u0439\u043b \u0448\u0440\u0438\u0444\u0442\u0430: ' + name + '.txt');
    }
}

var BASE_FONT_KEY = fontList[0].replace(/\r/g, '').replace(/^\s+|\s+$/g, '');
var BASE_FONT = FontRegistry[BASE_FONT_KEY];

MakeProperties();
Build();
Action.Continue();

function MakeProperties() {
    Prop = Action.Properties;

    TextIn = Prop.NewString('\u0422\u0435\u043a\u0441\u0442');
    TextIn.Value = '\u041f\u0420\u0418\u041c\u0415\u0420';

    var fontNames = [];
    for (var k in FontRegistry) fontNames.push(k);
    FontCombo = Prop.NewCombo('\u0428\u0440\u0438\u0444\u0442', fontNames.join('\n'));
    FontCombo.ItemIndex = 0;

    HeightNum = Prop.NewNumber('\u0412\u044b\u0441\u043e\u0442\u0430 \u0431\u0443\u043a\u0432, \u043c\u043c', 100);
    ThickNum = Prop.NewNumber('\u0422\u043e\u043b\u0449\u0438\u043d\u0430 (\u0433\u043b\u0443\u0431\u0438\u043d\u0430), \u043c\u043c', 10);
    SpacingNum = Prop.NewNumber('\u0414\u043e\u043f. \u043c\u0435\u0436\u0431\u0443\u043a\u0432\u0435\u043d\u043d\u044b\u0439 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b, \u043c\u043c', 0);

    OkBtn = Prop.NewButton('\u041f\u043e\u0441\u0442\u0440\u043e\u0438\u0442\u044c');
    OkBtn.Value = 'Ok';

    Prop.OnChange = function() {
        DeleteNewObjects();
        Build();
    };

    OkBtn.OnClick = function() {
        DeleteNewObjects();
        Build();
        Action.Commit();
        ViewAll();
        Action.Finish();
    };
}

// ¬озвращает данные буквы: сначала ищем в выбранном шрифте,
// если нет - берЄм из базового (донора)
function FindGlyph(font, ch) {
    var g = font.glyphs[ch];
    if (g) return { glyph: g, sourceFont: font };
    var gb = BASE_FONT.glyphs[ch];
    if (gb) return { glyph: gb, sourceFont: BASE_FONT };
    return null;
}

function Build() {
    var fontNames = [];
    for (var k in FontRegistry) fontNames.push(k);
    var fontName = fontNames[FontCombo.ItemIndex];
    var font = FontRegistry[fontName];
    var thick = ThickNum.Value;
    var text = TextIn.Value;
    var spacing = SpacingNum.Value;
    var targetHeight = HeightNum.Value;

    Ext = AddExtrusion('\u0422\u0435\u043a\u0441\u0442');
    StartEditing(Ext);

    var advance = 0;
    for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        var found = FindGlyph(font, ch);
        if (!found) {
            advance += (targetHeight / font.capHeight) * 0.3 + spacing;
            continue;
        }
        var g = found.glyph;
        var scale = targetHeight / found.sourceFont.capHeight;

        for (var oi = 0; oi < g.outer.length; oi++) {
            var C = NewContour();
            EmitContour(C, g.outer[oi], advance, scale);
            try {
                Ext.Contour.Addition(C);
            } catch (e) {
                alert('\u041e\u0448\u0438\u0431\u043a\u0430 \u0414\u041e\u0411\u0410\u0412\u041b\u0415\u041d\u0418\u042f, \u0431\u0443\u043a\u0432\u0430 \"' + ch + '\" (\u0432\u043d\u0435\u0448\u043d\u0438\u0439 #' + oi + '):\n' + e.message);
            }
        }
        for (var hi = 0; hi < g.holes.length; hi++) {
            var H = NewContour();
            EmitContour(H, g.holes[hi], advance, scale);
            try {
                Ext.Contour.Subtraction(H);
            } catch (e) {
                alert('\u041e\u0448\u0438\u0431\u043a\u0430 \u0412\u042b\u0427\u0418\u0422\u0410\u041d\u0418\u042f, \u0431\u0443\u043a\u0432\u0430 \"' + ch + '\" (\u0434\u044b\u0440\u043a\u0430 #' + hi + '):\n' + e.message);
            }
        }
        advance += g.w * scale + spacing;
    }

    Ext.Orient(AxisZ, AxisY);
    Ext.Thickness = thick;
    Ext.Build();
}

// —троит контур одной буквы по запечЄнным командам (линии/дуги),
// масштабиру€ под нужный размер и сдвига€ на позицию в строке
function EmitContour(C, cmds, adv, scale) {
    for (var i = 0; i < cmds.length; i++) {
        var c = cmds[i];
        if (c[0] == 'L') {
            C.AddLine(c[1][0]*scale + adv, c[1][1]*scale,
                       c[2][0]*scale + adv, c[2][1]*scale);
        } else {
            C.AddArc3(NewPoint(c[1][0]*scale + adv, c[1][1]*scale),
                       NewPoint(c[2][0]*scale + adv, c[2][1]*scale),
                       NewPoint(c[3][0]*scale + adv, c[3][1]*scale));
        }
    }
}
