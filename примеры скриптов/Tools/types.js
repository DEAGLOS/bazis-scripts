/**
 * Types description for Bazis8 environment
 * Copyright (c) Kolesnikov Roman 2013-2014  
 */

function MakeTypes() {

	/**
	 * The Definition class refers to the declaration of an identifier.
	 * The start and end are locations in the source code.
	 * Path is a URL corresponding to the document where the definition occurs.
	 * If range is undefined, then the definition refers to the entire document
	 * Range is a two element array with the start and end values
	 * (Exactly the same range field as is used in Esprima)
	 * If the document is undefined, then the definition is in the current document.
	 *
	 * @param String typeName
	 * @param {Array.<Number>} range
	 * @param String path
	 */
	var Definition = function(typeName, range, path, help) {
		this.typeName = typeName;
		this.range = range;
		this.path = path;
        this.help = help;
	};

    var HDefinition = function(typeName, help) {
		this.typeName = typeName;
        this.help = help;
	};

	var Global = function() {};
	Global.prototype = {
		$$proto : new Definition("Object"),

		parseInt : new Definition("?Number:str,[radix]"),
		parseFloat : new Definition("?Number:str,[radix]"),
		Math: new Definition("Math"),
		JSON: new Definition("JSON"),
		Object: new Definition("*Object:[val]"),
		Function: new Definition("*Function:"),
		Array: new Definition("*Array:[val]"),
		Boolean: new Definition("*Boolean:[val]"),
		Number: new Definition("*Number:[val]"),
		Date: new Definition("*Date:[val]"),
		RegExp: new Definition("*RegExp:[val]"),
		Error: new Definition("*Error:[err]"),
		'undefined' : new Definition("undefined:"),
		isNaN : new Definition("?Boolean:num"),
		isFinite : new Definition("?Boolean:num"),
		"NaN" : new Definition("Number"),
		"Infinity" : new Definition("Number"),
		
		NewVector : new HDefinition("?Vector:x,y,z", 'Создать 3D точку по координатам'),
		NewPoint : new HDefinition("?Point:x,y", 'Создать 2D точку по координатам'),
		NewContour: new HDefinition("?Contour2D:", 'Создать плоский контур'),
        NewCOMObject: new HDefinition("?Object:'CLSID'", 'Создать новый COM объект по его типу'),
		
		AxisX : new Definition("Vector"),
		AxisY : new Definition("Vector"),
		AxisZ : new Definition("Vector"),
		Axis_X : new Definition("Vector"),
		Axis_Y : new Definition("Vector"),
		Axis_Z : new Definition("Vector"),
		
		system : new HDefinition("System", 'Системные функции'),
		Model : new HDefinition("Model3D", 'Структура модели'),
		Action : new HDefinition("Action3D", 'Активный скрипт'),
		ActiveMaterial : new HDefinition("FurnMaterial", 'Текущий материал'),
		Undo : new HDefinition("Undo3D", 'История модели'),
        AnimationType : new HDefinition("SalonAnimationType", 'Типы анимации сборок и блоков'),
        TextureOrientation : new HDefinition("TextureOrientationType", 'Типы анимации сборок и блоков'),        
		
		prompt : new HDefinition('?String:"Введите_имя"', 'Вывести окно ввода строки'),
		alert : new HDefinition('?undefined:str', 'Вывести окно сообщения'),
		confirm : new HDefinition('?Boolean:"Подтверждение"', 'Показать окно подтверждения (Да/Нет)'),
		
		OpenFurniture : new HDefinition('?InfFurniture:file.f3d', 'Открыть фурнитуру для установки на модель'),
		
		SelectAll : new HDefinition('?undefined:', 'Выделить всё'),
		UnSelectAll : new HDefinition('?undefined:', 'Снять выделение с модели'),
		ViewAll : new HDefinition('?undefined:', 'Показать всё'),
		SetCamera : new HDefinition('?undefined:p3d', 'Установить текущий вид'),
				
		GetPoint : new HDefinition('?Vector:"Укажите точку"', 'Запрос точки'),
		GetObject : new HDefinition('?Object3:"Укажите объект"', 'Запрос объекта модели'),
        GetPanel : new HDefinition('?Panel:"Укажите панель"', 'Запрос панели'),
		GetEdge : new HDefinition('?Edge3:"Укажите границу",Axis',
          'Запрос выбора ребра, параллельного указанному вектору'),
				
		AddPanel : new HDefinition("?Panel:width,height", 'Создать панель указанных размеров'),
		AddFrontPanel : new HDefinition("?Panel:x1,y1,x2,y2,z", 'Создать фронтальную панель'),
		AddHorizPanel : new HDefinition("?Panel:x1,z1,x2,z2,y", 'Создать горизонтальную панель'),
		AddVertPanel : new HDefinition("?Panel:z1,y1,z2,y2,x", 'Создать вертикальную панель'),
		AddExtrusion : new HDefinition("?Extrusion:name", 'Создать профиль'),
		AddTrajectory : new HDefinition("?Trajectory:name", 'Создать тело по траектории'),
		AddBlock : new HDefinition('?Block:"Имя_блока"', 'Создать мебельный блок'),
		AddAssembly : new HDefinition('?Block:"Имя_сборки"', 'Создать мебельную сборку'),
        AddCopy : new HDefinition('?Object3:obj', 'Создать копию объекта'),
        AddSymmetry : new HDefinition('?Object3:obj, pos, normal', 'Создать симметричную копию объекта'),
		
		DeleteNewObjects : new HDefinition("?undefined:", 'Удалить объекты ранее созданные в скрипте'),
		DeleteObject : new HDefinition("?undefined:obj", 'Удалить объект из модели'),
        
        StartEditing: new HDefinition("?Object3:obj", 'Функция начала редактирования объекта'),
		
		BeginBlock : new HDefinition('?Block:"Имя_блока"', 'Начать создание блока. Все созданные далее объекты попадают внутрь блока'),
		EndBlock : new HDefinition('?undefined:', 'Закончить создание блока'),
                
        BeginParametricBlock : new HDefinition('?Block:"Имя_блока"', 'Начать создание редактируемого блока'),
		EndParametricBlock : new HDefinition('?undefined:', 'Закончить создание редактируемого блока'),
        ParametricBlock : new HDefinition("Block", 'Редактируемый блок. Переменная установлена, если скрипт запущен в режиме редактирования'),
		
		NewButtonInput : new HDefinition('?InButton:"Кнопка"', 'Создать элемент управления - кнопку'),
		NewFloatInput : new HDefinition('?InFloat:"Ввод_числа"', 'Создать элемент управления для ввода целого числа'),
		NewNumberInput : new HDefinition('?InNumber:"Ввод_числа"', 'Создать элемент управления для ввода числа'),
		NewMaterialInput : new HDefinition('?InMaterial:"Материал"', 'Создать элемент управления для выбора материала'),
		NewButtMaterialInput : new HDefinition('?InButtMaterial:"Кромка"', 'Создать элемент управления для выбора кромочного материала'),
		NewFurnitureInput : new HDefinition('?InFurniture:"Фурнитура"', 'Создать элемент управления для выбора фурнитуры')
				
	};

	var initialGlobalProperties = [];
	for (var prop in Global) {
		if (Global.hasOwnProperty(prop)) {
			initialGlobalProperties.push(prop);
		}
	}

	/**
	 * A prototype that contains the common built-in types
	 */
	var Types = function() {

		// this object can be touched by clients
		// and so must not be in the prototype
		// the global 'this'		
		this.Global = new Global();		

		// TODO FIXADE should be declared on prototype
		this.clearDefaultGlobal = function() {
			for (var i = 0; i < initialGlobalProperties.length; i++) {
				if (this.Global[initialGlobalProperties[i]]) {
					delete this.Global[initialGlobalProperties[i]];
				}
			}
		};		

	};	
	
	Types.prototype = {

		System : {
			$$isBuiltin: true,			
			require: new HDefinition("?undefined:file.js", 'Подключить указанный файл JavaScript'),
            log: new HDefinition("?undefined:str", 'Вывести диагностическое сообщение (для отладки)'),
			fileExists: new HDefinition("?undefined:'file.txt'", 'Существует ли указанный файл?'),
            askFileName: new HDefinition("?String:'ext'", 'Открыть диалог выбора файла'),
            writeTextFile: new HDefinition("?undefined:'file.txt', content", 'Записать текст в файл'),
            askWriteTextFile: new HDefinition("?undefined:'txt', content", 'Записать текст в файл с запросом имени файла'),
            readTextFile: new HDefinition("?String:'file.txt'", 'Считать текст из файла'),
            askReadTextFile: new HDefinition("?String:'txt'", 'Считать текст из файла с запросом выбора файла'),
            secureExec: new HDefinition("?undefined:str", 'Выполнить зашифрованный код'),
            exec: new HDefinition("?Boolean:str", 'Выполнить внешнюю программу'),
            sleep: new HDefinition("?undefined:1000", 'Задерживает выполнение программы на указанное время (в милисекундах)'),
            apiVersion: new HDefinition("Number", 'Текущая версия Bazis API')
		},
	
		Model3D : {
			$$isBuiltin: true,			
			GSize: new HDefinition("Vector", 'Размер модели'),
			GMin: new HDefinition("Vector", 'Габарит модели'),
			GMax: new HDefinition("Vector", 'Габарит модели'),
			Selected: new HDefinition("Object3", 'Выделенный объект модели'),
			SelectionCount: new HDefinition("Number", 'Количество выделенных элементов'),
			Selections: new HDefinition("Array.<Object3>", 'Список выделенных элементов'),
			Count: new HDefinition("Number", 'Количество объектов в модели'),
			Objects: new HDefinition('Array.<Object3>', 'Список объектов модели')
		},
		
		Action3D : {
			$$isBuiltin: true,
            
            Interactive: new HDefinition("Boolean", 'Если false, то запрещены любые функции взаимодействия с пользователем'),
                                
            Continue: new HDefinition("?undefined:", 'Продолжить вызывать прерывания по завершению основного тела скрипта, не завершая команды'),
            Commit: new HDefinition("?undefined:", 'Применить изменения в модели внесенные в скрипте'),
            Finish: new HDefinition("?undefined:", 'Завершить команду'),
            Cancel: new HDefinition("?undefined:", 'Отменить команду'),
            AsyncExec: new HDefinition("?undefined:function(){ }", 'Выполнить функцию, в которой доступны запросы Get*'),
            
			MouseX: new HDefinition("Number", 'Позиция курсора'),
			MouseY: new HDefinition("Number", 'Позиция курсора'),
			
			Pos3: new HDefinition("Vector", 'Текущая позиция маркера'),
			ViewDir: new HDefinition("Vector", 'Нормаль к текущему виду'),
			UpDir: new HDefinition("Vector", 'Вектор вверх текущего вида'),
			RightDir: new HDefinition("Vector", 'Вектор вправо текущего вида'),
			
			ShowPoints: new HDefinition("Boolean", 'Разрешать подсвечивать точки'),
			ShowEdges: new HDefinition("Boolean", 'Разрешать подсвечивать ребра'),
			
			Hint: new HDefinition("String", 'Установить строку подсказки'),
			ErrorHint: new HDefinition("String", 'Установить сообщение об ошибке'),
			BlinkHint: new HDefinition("String", 'Установить мигающую подсказку'),
			
			BeginOrtho3: new HDefinition("?undefined:pos", 'Включить режим Орто относительно точки'),
			EndOrtho3: new HDefinition("?undefined:", 'Отключить режим Орто'),
			
			CursorToClosestPoint: new HDefinition("?undefined:", 'Сдвинуть курсор к ближайшей точке привязки'),
			CursorToClosestLine: new HDefinition("?undefined:", 'Сдвинуть курсор к ближайшей линии'),
			CursorToMiddleOfLine: new HDefinition("?undefined:", 'Сдвинуть курсор к ближайшей середине линии'),
			
			Find3DPoint : new HDefinition("?Vector:", 'Найти точку на модели в текущем положении курсора мыши'),
			Find3DPointXZPlane : new HDefinition("?Vector:", 'Найти точку на плоскости X0Z'),
            Get3DObject : new HDefinition('?Object3:', 'Найти объект под курсором мыши'),                    
            
            OnClick : new HDefinition("Function", 'Обработчик щелчка мыши'),
            OnMove : new HDefinition("Function", 'Обработчик щелчка мыши'),
            OnStart : new HDefinition("Function", 'Обработчик начала работы скрипта. Вызывается после загрузки значений свойств'),
            OnFinish : new HDefinition("Function", 'Обработчик завершения работы скрипта'),
            
            Properties: new HDefinition("ScriptProperty", 'Набор редактируемых свойств')
		},
        
        ScriptProperty: {
			$$isBuiltin: true,
			Name: new HDefinition("String", 'Имя свойства'),
            Enabled: new HDefinition("Boolean", 'Возможность выделение свойства пользователем'),
            ChildrenEnabled: new HDefinition("Boolean", 'Выделение вложенных свойств'),
            Visible: new HDefinition("Boolean", 'Видимость свойства в окне свойств'), 
            OnChange : new HDefinition("Function", 'Обработчик изменения свойства и вложенных свойств'),
            
            Count: new HDefinition("Number", 'Количество вложенных свойств'),
			Items: new HDefinition('Array.<ScriptProperty>', 'Список вложенных свойств'),
            Clear: new HDefinition("?undefined:", 'Очистить вложенные свойства'),
            
            Store: new HDefinition("Boolean", 'Флаг, сохраняется ли свойство в файл'), 
            Save: new HDefinition("?undefined:'file.xml'", 'Сохранить введенные пользователем данные в файле xml'),
            Load: new HDefinition("?Boolean:'file.xml'", 'Загрузить значения полей из файла xml'),
            
            NewGroup: new HDefinition("?ScriptGroupProperty:'Название'", 'Создать вложенную группу свойств'),
            NewImage: new HDefinition("?ScriptGroupProperty:'Название',imagefile", 'Создать вложенную группу свойств c рисунком'),
            NewString: new HDefinition("?ScriptStringProperty:'Название'", 'Создать строковое свойство'),
            NewBool: new HDefinition("?ScriptBooleanProperty:'Название'", 'Создать свойство вида Да/Нет'),
            NewNumber: new HDefinition("?ScriptNumberProperty:'Название'", 'Создать числовое свойство'),
            NewButton: new HDefinition("?ScriptButtonProperty:'Название'", 'Создать кнопку'),
            NewSelector: new HDefinition("?ScriptSelectorProperty:'Название'", 'Создать свойство с кнопкой редактирования'),
            NewCombo: new HDefinition("?ScriptComboProperty:'Название', 'Item1'", 'Создать свойство - выпадающий список'),
            NewMaterial: new HDefinition("?ScriptMaterialProperty:'Название'", 'Создать свойство типа материал'),
            NewButt: new HDefinition("?ScriptButtProperty:'Название'", 'Создать свойство типа материал'),
            NewFurniture: new HDefinition("?ScriptFurnitureProperty:'Название'", 'Создать свойство типа материал'),
		},
        
        ScriptGroupProperty: {
            $$isBuiltin: true,
            $$proto : new Definition("ScriptProperty"),
            Image: new HDefinition("String"),
            MaxHeight: new HDefinition("Number")
        },
        
        ScriptStringProperty: {
            $$isBuiltin: true,
            $$proto : new Definition("ScriptProperty"),
            Value: new HDefinition("String")        
        },
        
        ScriptBooleanProperty: {
            $$isBuiltin: true,
            $$proto : new Definition("ScriptProperty"),
            Value: new HDefinition("Boolean")        
        },
        
        ScriptNumberProperty: {
            $$isBuiltin: true,
            $$proto : new Definition("ScriptProperty"),
            Value: new HDefinition("Number") 
        },
        
        ScriptButtonProperty: {
            $$isBuiltin: true,
            $$proto : new Definition("ScriptProperty"),            
            OnClick : new HDefinition("Function", 'Обработчик нажатия на кнопку')
        },
        
        ScriptSelectorProperty: {
            $$isBuiltin: true,
            $$proto : new Definition("ScriptProperty"),
            Value: new HDefinition("String"),
            OnClick : new HDefinition("Function", 'Обработчик нажатия на кнопку редактирования свойства')
        },
        
        ScriptComboProperty: {
            $$isBuiltin: true,
            $$proto : new Definition("ScriptProperty"),
            ItemIndex: new HDefinition("Number"),
            Value: new HDefinition("String")            
        },
        
        ScriptMaterialProperty: {
            $$isBuiltin: true,
            $$proto : new Definition("ScriptProperty"),            
            Thickness: new HDefinition("Number"),
            SetActive: new HDefinition("?undefined:",
              'Установить активным. Все последующие элементы будут построены из этого материала')
        },
        
        ScriptButtProperty: {
            $$isBuiltin: true,
            $$proto : new Definition("ScriptProperty"),            
            SetActive: new HDefinition("?undefined:",
              'Установить активным. Все последующие элементы будут построены из этого материала')
        },
        
        ScriptFurnitureProperty: {
            $$isBuiltin: true,
            $$proto : new Definition("ScriptProperty"),            
            Value: new HDefinition("InfFurniture")
        },
        
		
		Undo3D: {
		  $$isBuiltin: true,
		  Changing: new Definition("?undefined:obj"),
		  RecursiveChanging: new Definition("?undefined:obj")
		},
		
		FurnMaterial: {
			$$isBuiltin: true,
			Name: new Definition("String"),
			Thickness: new Definition("Number"),
			Width: new Definition("Number"),
			Make: new HDefinition("?undefined:name,thick", 'Создать материал из наименования и толщины (ширины)')
		},
		
		Vector : {
			$$isBuiltin: true,
			x: new Definition("Number"),
			y: new Definition("Number"),
			z: new Definition("Number")
		},
		
		Point : {
			$$isBuiltin: true,
			x: new Definition("Number"),
			y: new Definition("Number")
		},
		
		Edge3 : {
			$$isBuiltin: true,
			First: new HDefinition("Vector", 'Начало ребра в ЛСК'),
			Last: new HDefinition("Vector", 'Конец ребра в ЛСК'),
            GFirst: new HDefinition("Vector", 'Начало ребра'),
			GLast: new HDefinition("Vector", 'Конец ребра')
		},
						
		Object : {
			$$isBuiltin: true,			
			// Can't use the real property name here because would override the real methods of that name
			$_$prototype : new Definition("Object"),
			$_$toString: new Definition("?String:"),
			$_$toLocaleString : new Definition("?String:"),
			$_$valueOf: new Definition("?Object:"),
			$_$hasOwnProperty: new Definition("?Boolean:property"),
			$_$isPrototypeOf: new Definition("?Boolean:object"),
			$_$propertyIsEnumerable: new Definition("?Boolean:property")
		},
		
		Object3 : {
			$$isBuiltin: true,
			$$proto : new Definition("Object"),
			
			Name: new HDefinition("String", 'Наименование'),
			ArtPos: new HDefinition("String", 'Артикул'),
			Owner: new HDefinition("List3D", 'Родитель объекта'),
			Visible: new HDefinition("Boolean", 'Видимость объекта'),
			Selected: new HDefinition("Boolean", 'Является ли объект выделенным'),
			
			List: new HDefinition("Boolean", 'Является ли объект структурным'),
			AsList: new HDefinition("List3D", 'Привести объект к структурному'),
			AsPanel: new HDefinition("Panel", 'Привести объект к типу панели'),
			
			Position: new HDefinition("Vector", 'Положение объекта'),
			PositionX: new HDefinition("Number", 'Координата x'),
			PositionY: new HDefinition("Number", 'Координата y'),
			PositionZ: new HDefinition("Number", 'Координата z'),
			SetDefaultTransform: new HDefinition("?undefined", 'Установить нулевые положение и ориентацию объекта'),
			Translate: new HDefinition("?undefined:dir", 'Сместить объект'),
			Rotate: new HDefinition("?undefined:axis,angle", 'Повернуть вокруг заданной оси'),
			TranslateGCS: new HDefinition("?undefined:dir", ''),
			RotateGCS: new HDefinition("?undefined:axis,angle", ''),
			RotateX: new HDefinition("?undefined:angle", 'Повернуть вокруг оси X'),
			RotateY: new HDefinition("?undefined:angle", 'Повернуть вокруг оси Y'),
			RotateZ: new HDefinition("?undefined:angle", 'Повернуть вокруг оси Z'),
			Orient: new HDefinition("?undefined:axisz,axisy", 'Развернуть объект вдоль осей'),
			OrientGCS: new HDefinition("?undefined:axisz,axisy", ''),            
			
			ToObject: new HDefinition("?Vector:pos", 'Преобразовать точку в ЛСК объекта'),
			ToGlobal: new HDefinition("?Vector:pos", 'Преобразовать точку из ЛСК объекта'),
			NToObject: new HDefinition("?Vector:dir", 'Преобразовать нормаль в ЛСК объекта'),
			NToGlobal: new HDefinition("?Vector:dir", 'Преобразовать нормаль из ЛСК объекта'),
			
			GSize: new HDefinition("Vector", 'Локальные размеры объекта'),
			GMin: new HDefinition("Vector", 'Габарит объекта в ЛСК'),
			GMax: new HDefinition("Vector", 'Габарит объекта в ЛСК'),
			GabMin: new HDefinition("Vector", 'Габарит объекта'),
			GabMax: new HDefinition("Vector", 'Габарит объекта'),
			
			Build: new HDefinition("?undefined", 'Перестроить объект после изменения его свойств')
		},
		
		List3D : {
			$$isBuiltin: true,			
			$$proto : new Definition("Object3"),
			Count: new HDefinition("Number", 'Количество объектов в структуре'),
			Objects: new HDefinition('Array.<Object3>', 'Список объектов'),
            Find: new HDefinition("?Object3:'name'", 'Найти объект по имени'),
			Load: new HDefinition("?Boolean:file", 'Загрузить объекты из файлов *.b3d,*.f3d')
		},
		
		Panel : {
			$$isBuiltin: true,	
			$$proto : new Definition("Object3"),
			Contour : new HDefinition("Contour2D", 'Контур панели'),
			ContourWidth : new HDefinition("Number", 'Ширина контура панели'),
			ContourHeight : new HDefinition("Number", 'Высота контура панели'),
			Thickness : new HDefinition("Number", 'Толщина панели'),
			MaterialName : new HDefinition("String", 'Материал панели'),
			MaterialWidth : new HDefinition("Number", 'Ширина материала'),
            TextureOrientation : new HDefinition("TextureOrientation", 'Ориентация текстуры'),
			
			Butts : new HDefinition("PanelButts", 'Список кромок'),
			Plastics : new HDefinition("PanelPlastics", 'Список пластиков'),
			Cuts : new HDefinition("PanelCuts", 'Список пазов'),
            
            IsButtVisible: new HDefinition("?PanelButt:index,0.5", 'Закрыта ли кромка другими панелями?'),

			AddButt : new HDefinition("?PanelButt:material,elem", 'Накатать кромку на элемент'),
			AddPlastic : new HDefinition("?PanelPlastic:material,true", 'Наклеить пластик на панель'),
			AddCut : new HDefinition("?PanelCut:name", 'Создать новый паз')
		},
		
		Extrusion : {
			$$isBuiltin: true,	
			$$proto : new Definition("Object3"),
            Contour: new HDefinition("Contour2D", 'Контур профиля'),
            Thickness : new HDefinition("Number", 'Длина профиля'),
			MaterialName: new HDefinition("String", 'Материал'),
            MaterialWidth : new HDefinition("Number", 'Ширина материала'),
            Clip : new HDefinition("?undefined:pos,normal", 'Отрезать часть профиля в точке pos перпендикулярно normal')
		},
		
		Trajectory : {
			$$isBuiltin: true,	
			$$proto : new Definition("Object3"),
			Contour2D: new Definition("Contour2D"),			
			Trajectory2D: new Definition("Contour2D"),			
			MaterialName: new Definition("String"),
            MaterialWidth : new HDefinition("Number", 'Ширина материала')
		},
		
		Block : {
			$$isBuiltin: true,
			$$proto : new Definition("List3D"),
            AnimType: new Definition("AnimationType"),
			IsFastener: new HDefinition("?Boolean:", 'Флаг составной фурнитуры')
		},
		
		Assembly : {
			$$isBuiltin: true,
			$$proto : new Definition("List3D"),
            AnimType: new HDefinition("AnimationType")
		},
        
        SalonAnimationType : {
            None: new HDefinition("AnimationType", "Не учитывается в салоне"),
            Custom: new HDefinition("AnimationType", "Учитывается в салоне, не имеет анимации"),
            DoorLeft: new HDefinition("AnimationType", "Дверь левая"),
            DoorRight: new HDefinition("AnimationType", "Дверь правая"),
            DoorFlap: new HDefinition("AnimationType", "Дверь откидная"),
            DoorLift: new HDefinition("AnimationType", "Дверь подъемная"),
            SDoorLeft: new HDefinition("AnimationType", "Дверь купе левая"),
            SDoorRight: new HDefinition("AnimationType", "Дверь купе правая"),
            Box: new HDefinition("AnimationType", "Ящик"),
            Support: new HDefinition("AnimationType", "Опора"),
            Handle: new HDefinition("AnimationType", "Ручка"),
            Facade: new HDefinition("AnimationType", "Фасад")
        },
        
        TextureOrientationType : {
            None: new HDefinition("TextureOrientation", "Нет"),
            Horizontal: new HDefinition("TextureOrientation", "Горизонтально"),
            Vertical: new HDefinition("TextureOrientation", "Вертикально")            
        },
		
		PanelButts : {
			$$isBuiltin: true,			
			Add: new Definition("?PanelButt:"),
			Count: new Definition("Number"),
			Butts: new Definition('Array.<PanelButt>')			
		},
		
		PanelButt : {
			$$isBuiltin: true,			
			ElemIndex: new Definition("Number"),
			Sign: new Definition("String"),
			Material: new Definition("String"),
			Thickness: new Definition("Number")
		},
		
		PanelPlastics : {
			$$isBuiltin: true,			
			Add: new Definition("?PanelPlastic:"),
			Count: new Definition("Number"),
			Plastics: new Definition('Array.<PanelPlastic>')			
		},
		
		PanelPlastic : {
			$$isBuiltin: true,			
			Material: new Definition("String"),
			Thickness: new Definition("Number"),
			TextureOrientation: new Definition("TextureDir")
		},
		
		PanelCuts : {
			$$isBuiltin: true,			
			Add: new Definition("?PanelCut:"),
			Count: new Definition("Number"),
			Cuts: new Definition('Array.<PanelCut>')			
		},
		
		PanelCut : {
			$$isBuiltin: true,			
			Name: new Definition("String"),
			Sign: new HDefinition("String", 'Условное обозначение'),
			Trajectory: new HDefinition("Contour2D", 'Траектория паза'),
			Contour: new HDefinition("Contour2D", 'Профиль паза')
		},
		
		Contour2D : {
			$$isBuiltin: true,
			Count: new HDefinition("Number", 'Количество элементов контура'),
            Width: new HDefinition("Number", 'Ширина контура'),
            Height: new HDefinition("Number", 'Высота контура'),
			Clear: new HDefinition("?undefined:", 'Очистить контур'),
			Move: new HDefinition("?undefined:dx,dy", 'Сдвинуть все элементы'),
			Rotate: new HDefinition("?undefined:x,y,angle", 'Повернуть вокруг точки'),
			AddRectangle : new HDefinition("?undefined:x1,y1,x2,y2", 'Добавить прямоугольник'),
			AddRoundRect : new HDefinition("?undefined:x1,y1,x2,y2,rad", 'Добавить прямоугольник со скурглёнными краями'),
			AddLine : new HDefinition("?Object:x1,y1,x2,y2", 'Добавить линию'),
			AddCircle : new HDefinition("?Object:xc,yc,rad", 'Добавить окружность'),
			AddArc : new HDefinition("?Object:p1,p2,centre,true", 'Добавить дугу по началу, концу и центру'),
			AddArc3 : new HDefinition("?Object:p1, p2, p3", 'Добавить дугу по 3 точкам'),
			Subtraction : new HDefinition("?undefinded:contour", 'Вычесть замкнутый контур'),
			Addition : new HDefinition("?undefinded:contour", 'Сложить с замкнутым контуром'),
			RoundingEx : new HDefinition("?Object:elem1,elem2,x,y,radius", 'Скругление элементов'),
			FacetEx : new HDefinition("?Object:elem1,elem2,l1,l2", 'Фаска на 2 элементах'),
			Rounding : new HDefinition("?Object:x,y,radius", 'Скругление в указанной точке'),
			Facet : new HDefinition("?Object:x,y,l", 'Фаска в указанной точке'),
			Find : new HDefinition("?Object:x,y", 'Найти ближайший элемент по координатам'),
			Fit : new HDefinition("?undefined:x1,y1,x2,y2", 'Вписать весь контур в заданные габариты'),
			Elastic : new HDefinition("?undefined:x1,y1,x2,y2,dx,dy", 'Растянуть контур резиновой нитью'),
			Symmetry : new HDefinition("?undefined:x1,y1,x2,y2,true", 'Отразить контур относительно линии'),
			Load: new HDefinition("?Boolean:file", 'Загрузить контур из файла *.frw')
		},
		
		InControl : {
			$$isBuiltin: true,
			id: new Definition("Number"),
			Enabled: new Definition("Boolean"),
			Visible: new Definition("Boolean"),
			Hint: new Definition("String"),
            OnChange : new HDefinition("Function", 'Обработчик'),
		},
		
		InButton : {
			$$isBuiltin: true,
			$$proto : new Definition("InControl"),
		},
		
		InFloat : {
			$$isBuiltin: true,
			$$proto : new Definition("InControl"),
			Value: new Definition("Number"),
			ReadOnly: new Definition("Boolean"),
			Fixed: new Definition("Boolean")
		},
		
		InNumber : {
			$$isBuiltin: true,
			$$proto : new Definition("InControl"),
			Value: new Definition("Number"),
			ReadOnly: new Definition("Boolean"),
			Fixed: new Definition("Boolean")
		},
		
		InMaterial : {
			$$isBuiltin: true,
			$$proto : new Definition("InControl"),
			Name: new Definition("String"),
			Thickness: new Definition("Number"),
			Width: new Definition("Number"),
			SetActive: new HDefinition("?undefined:",
              'Установить активным. Все последующие элементы будут построены из этого материала'),
			Apply: new HDefinition("?undefined:Object3", 'Применить материал к указанному объекту')
		},
		
		InButtMaterial : {
			$$isBuiltin: true,
			$$proto : new Definition("InControl"),
			Name: new Definition("String"),
			Sign: new Definition("String"),
			Thickness: new Definition("Number"),
			Width: new Definition("Number"),
			Overhung: new Definition("Number"),
			Allowance: new Definition("Number"),
			ClipPanel: new Definition("Boolean")
		},
		
		InFurniture : {
			$$isBuiltin: true,
			$$proto : new Definition("InControl"),
			Mount: new HDefinition("?Object3:panel1,panel2,x,y,z", 'Установить крепеж между двух панелей'),
			Mount1: new HDefinition("?Object3:panel,x,y,z,angle", 'Установить крепеж на плоскость панели')
		},
		
		InfFurniture : {
			$$isBuiltin: true,			
            Mount: new HDefinition("?Object3:panel1,panel2,x,y,z", 'Установить крепеж между двух панелей'),
			Mount1: new HDefinition("?Object3:panel,x,y,z,angle", 'Установить крепеж на плоскость панели')
		},

		/**
		 * See 15.3.4 Properties of the Function Prototype Object
		 */
		Function : {
			$$isBuiltin: true,
			apply : new Definition("?Object:func,[argArray]"),
			"arguments" : new Definition("Arguments"),
			bind : new Definition("?Object:func,[args...]"),
			call : new Definition("?Object:func,[args...]"),
			caller : new Definition("Function"),
			length : new Definition("Number"),
			name : new Definition("String"),
			$$proto : new Definition("Object")
		},

		/**
		 * See 15.4.4 Properties of the Array Prototype Object
		 */
		Array : {
			$$isBuiltin: true,

			concat : new Definition("?Array:first,[rest...]"),
			join : new Definition("?String:separator"),
			length : new Definition("Number"),
			pop : new Definition("?Object:"),
			push : new Definition("?Object:[vals...]"),
			reverse : new Definition("?Array:"),
			shift : new Definition("?Object:"),
			slice : new Definition("?Array:start,deleteCount,[items...]"),
			splice : new Definition("?Array:start,end"),
			sort : new Definition("?Array:[sorter]"),
			unshift : new Definition("?Number:[items...]"),
			indexOf : new Definition("?Number:searchElement,[fromIndex]"),
			lastIndexOf : new Definition("?Number:searchElement,[fromIndex]"),
			every : new Definition("?Boolean:callbackFn,[thisArg]"),
			some : new Definition("?Boolean:callbackFn,[thisArg]"),
			forEach : new Definition("?Object:callbackFn,[thisArg]"),  // should return
			map : new Definition("?Array:callbackFn,[thisArg]"),
			filter : new Definition("?Array:callbackFn,[thisArg]"),
			reduce : new Definition("?Array:callbackFn,[initialValue]"),
			reduceRight : new Definition("?Array:callbackFn,[initialValue]"),
			$$proto : new Definition("Object")
		},

		/**
		 * See 15.5.4 Properties of the String Prototype Object
		 */
		String : {
			$$isBuiltin: true,
			charAt : new Definition("?String:index"),
			charCodeAt : new Definition("?Number:index"),
			concat : new Definition("?String:array"),
			indexOf : new Definition("?Number:searchString,[start]"),
			lastIndexOf : new Definition("?Number:searchString,[start]"),
			length : new Definition("Number"),
			localeCompare : new Definition("?Number:Object"),
			match : new Definition("?Boolean:regexp"),
			replace : new Definition("?String:searchValue,replaceValue"),
			search : new Definition("?String:regexp"),
			slice : new Definition("?String:start,end"),
			split : new Definition("?Array:separator,[limit]"),  // Array of string
			substring : new Definition("?String:start,end"),
			toLocaleUpperCase : new Definition("?String:"),
			toLowerCase : new Definition("?String:"),
			toLocaleLowerCase : new Definition("?String:"),
			toUpperCase : new Definition("?String:"),
			trim : new Definition("?String:"),

			$$proto : new Definition("Object")
		},

		/**
		 * See 15.6.4 Properties of the Boolean Prototype Object
		 */
		Boolean : {
			$$isBuiltin: true,
			$$proto : new Definition("Object")
		},

		/**
		 * See 15.7.4 Properties of the Number Prototype Object
		 */
		Number : {
			$$isBuiltin: true,
			toExponential : new Definition("?Number:digits"),
			toFixed : new Definition("?Number:digits"),
			toPrecision : new Definition("?Number:digits"),
			// do we want to include NaN, MAX_VALUE, etc?

			$$proto : new Definition("Object")
		},

		/**
		 * See 15.8.1 15.8.2 Properties and functions of the Math Object
		 * Note that this object is not used as a prototype to define other objects
		 */
		Math : {
			$$isBuiltin: true,

			// properties
			E : new Definition("Number"),
			LN2 : new Definition("Number"),
			LN10 : new Definition("Number"),
			LOG2E : new Definition("Number"),
			LOG10E : new Definition("Number"),
			PI : new Definition("Number"),
			SQRT1_2 : new Definition("Number"),
			SQRT2 : new Definition("Number"),

			// Methods
			abs : new Definition("?Number:val"),
			acos : new Definition("?Number:val"),
			asin : new Definition("?Number:val"),
			atan : new Definition("?Number:val"),
			atan2 : new Definition("?Number:val1,val2"),
			ceil : new Definition("?Number:val"),
			cos : new Definition("?Number:val"),
			exp : new Definition("?Number:val"),
			floor : new Definition("?Number:val"),
			log : new Definition("?Number:val"),
			max : new Definition("?Number:val1,val2"),
			min : new Definition("?Number:val1,val2"),
			pow : new Definition("?Number:x,y"),
			random : new Definition("?Number:"),
			round : new Definition("?Number:val"),
			sin : new Definition("?Number:val"),
			sqrt : new Definition("?Number:val"),
			tan : new Definition("?Number:val"),
			$$proto : new Definition("Object")
		},


		/**
		 * See 15.9.5 Properties of the Date Prototype Object
		 */
		Date : {
			$$isBuiltin: true,
			toDateString : new Definition("?String:"),
			toTimeString : new Definition("?String:"),
			toUTCString : new Definition("?String:"),
			toISOString : new Definition("?String:"),
			toJSON : new Definition("?Object:key"),
			toLocaleDateString : new Definition("?String:"),
			toLocaleTimeString : new Definition("?String:"),

			getTime : new Definition("?Number:"),
			getTimezoneOffset : new Definition("?Number:"),

			getDay : new Definition("?Number:"),
			getUTCDay : new Definition("?Number:"),
			getFullYear : new Definition("?Number:"),
			getUTCFullYear : new Definition("?Number:"),
			getHours : new Definition("?Number:"),
			getUTCHours : new Definition("?Number:"),
			getMinutes : new Definition("?Number:"),
			getUTCMinutes : new Definition("?Number:"),
			getSeconds : new Definition("?Number:"),
			getUTCSeconds : new Definition("?Number:"),
			getMilliseconds : new Definition("?Number:"),
			getUTCMilliseconds : new Definition("?Number:"),
			getMonth : new Definition("?Number:"),
			getUTCMonth : new Definition("?Number:"),
			getDate : new Definition("?Number:"),
			getUTCDate : new Definition("?Number:"),

			setTime : new Definition("?Number:"),
			setTimezoneOffset : new Definition("?Number:"),

			setDay : new Definition("?Number:dayOfWeek"),
			setUTCDay : new Definition("?Number:dayOfWeek"),
			setFullYear : new Definition("?Number:year,[month],[date]"),
			setUTCFullYear : new Definition("?Number:year,[month],[date]"),
			setHours : new Definition("?Number:hour,[min],[sec],[ms]"),
			setUTCHours : new Definition("?Number:hour,[min],[sec],[ms]"),
			setMinutes : new Definition("?Number:min,[sec],[ms]"),
			setUTCMinutes : new Definition("?Number:min,[sec],[ms]"),
			setSeconds : new Definition("?Number:sec,[ms]"),
			setUTCSeconds : new Definition("?Number:sec,[ms]"),
			setMilliseconds : new Definition("?Number:ms"),
			setUTCMilliseconds : new Definition("?Number:ms"),
			setMonth : new Definition("?Number:month,[date]"),
			setUTCMonth : new Definition("?Number:month,[date]"),
			setDate : new Definition("?Number:date"),
			setUTCDate : new Definition("?Number:gate"),

			$$proto : new Definition("Object")
		},

		/**
		 * See 15.10.6 Properties of the RexExp Prototype Object
		 */
		RegExp : {
			$$isBuiltin: true,
			source : new Definition("String"),
			global : new Definition("Boolean"),
			ignoreCase : new Definition("Boolean"),
			multiline : new Definition("Boolean"),
			lastIndex : new Definition("Boolean"),

			exec : new Definition("?Array:str"),
			test : new Definition("?Boolean:str"),

			$$proto : new Definition("Object")
		},

		"?RegExp:" : {
			$$isBuiltin: true,
			$$proto : new Definition("Function"),

			$1 : new Definition("String"),
			$2 : new Definition("String"),
			$3 : new Definition("String"),
			$4 : new Definition("String"),
			$5 : new Definition("String"),
			$6 : new Definition("String"),
			$7 : new Definition("String"),
			$8 : new Definition("String"),
			$9 : new Definition("String"),
			$_ : new Definition("String"),
			$input : new Definition("String"),
			input : new Definition("String"),
			name : new Definition("String")
		},


		/**
		 * See 15.11.4 Properties of the Error Prototype Object
		 * We don't distinguish between kinds of errors
		 */
		Error : {
			$$isBuiltin: true,
			name : new Definition("String"),
			message : new Definition("String"),
			stack : new Definition("String"),
			$$proto : new Definition("Object")
		},

		/**
		 * See 10.6 Arguments Object
		 */
		Arguments : {
			$$isBuiltin: true,
			callee : new Definition("Function"),
			length : new Definition("Number"),

			$$proto : new Definition("Object")
		},

		/**
		 * See 15.12.2 and 15.12.3 Properties of the JSON Object
		 */
		JSON : {
			$$isBuiltin: true,

			parse : new Definition("?Object:str"),
			stringify : new Definition("?String:obj"),
			$$proto : new Definition("Object")
		},

		"undefined" : {
			$$isBuiltin: true
		},



		// https://developer.mozilla.org/en/DOM/Console
		Console : {
			$$isBuiltin: true,
			debug : new Definition("?undefined:msg"),
			dir : new Definition("?undefined:obj"),
			error : new Definition("?undefined:msg"),
			group : new Definition("?undefined:"),
			groupCollapsed : new Definition("?undefined:"),
			groupEnd : new Definition("?undefined:"),
			info : new Definition("?undefined:msg"),
			log : new Definition("?undefined:msg"),
			time : new Definition("?undefined:timerName"),
			timeEnd : new Definition("?undefined:timerName"),
			trace : new Definition("?undefined:"),
			warn : new Definition("?undefined:msg")
		},

		// see http://www.w3.org/TR/dom/#node
		Node : {
			$$isBuiltin: true,
			$$proto : new Definition("Object"),

			nodeType : new Definition("Number"),
			nodeName : new Definition("String"),
			baseURI : new Definition("String"),
			ownerDocument : new Definition("Document"),
			parentNode : new Definition("Node"),
			parentElement : new Definition("Element"),
			childNodes : new Definition("NodeList"),
			firstChild : new Definition("Node"),
			lastChild : new Definition("Node"),
			previousSibling : new Definition("Node"),
			nextSibling : new Definition("Node"),
			nodeValue : new Definition("String"),
			textContent : new Definition("String"),

			hasChildNodes : new Definition("?Boolean:"),
			compareDocumentPosition : new Definition("?Number:other"),
			contains : new Definition("?Boolean:other"),
			insertBefore : new Definition("?Node:node,child"),
			appendChild : new Definition("?Node:node"),
			replaceChild : new Definition("?Node:node,child"),
			removeChild : new Definition("?Node:node,child"),
			normalize : new Definition("?undefined:"),
			cloneNode : new Definition("?Node:[deep]"),
			isEqualNode : new Definition("?Boolean:node"),
			lookupPrefix : new Definition("?String:namespace"),
			lookupNamespaceURI : new Definition("?String:prefix"),
			isDefaultNamespace : new Definition("?Boolean:namespace")
		},

		// Constants declared on Node
		"?Node:" : {
			$$isBuiltin: true,
			$$proto : new Definition("Function"),
			ELEMENT_NODE : new Definition("Number"),
			ATTRIBUTE_NODE : new Definition("Number"),
			TEXT_NODE : new Definition("Number"),
			CDATA_SECTION_NODE : new Definition("Number"),
			ENTITY_REFERENCE_NODE : new Definition("Number"),
			ENTITY_NODE : new Definition("Number"),
			PROCESSING_INSTRUCTION_NODE : new Definition("Number"),
			COMMENT_NODE : new Definition("Number"),
			DOCUMENT_NODE : new Definition("Number"),
			DOCUMENT_TYPE_NODE : new Definition("Number"),
			DOCUMENT_FRAGMENT_NODE : new Definition("Number"),
			NOTATION_NODE : new Definition("Number"),

			DOCUMENT_POSITION_DISCONNECTED : new Definition("Number"),
			DOCUMENT_POSITION_PRECEDING : new Definition("Number"),
			DOCUMENT_POSITION_FOLLOWING : new Definition("Number"),
			DOCUMENT_POSITION_CONTAINS : new Definition("Number"),
			DOCUMENT_POSITION_CONTAINED_BY : new Definition("Number"),
			DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : new Definition("Number")
		},
		
		// see http://www.w3.org/TR/dom/#attr
		Attr : {
			$$isBuiltin: true,
			$$proto : new Definition("Node"),

			isId : new Definition("Boolean"),
			name : new Definition("String"),
			value : new Definition("String"),
			namespaceURI : new Definition("String"),
			prefix : new Definition("String"),
			localName : new Definition("String")
		},

		// see http://www.w3.org/TR/dom/#interface-nodelist
		NodeList : {
			$$isBuiltin: true,
			$$proto : new Definition("Object"),

			item : new Definition("Node"),
			length : new Definition("Number")
		}
	};

	var protoLength = "~proto".length;
	return {
		Types : Types,
		Definition : Definition,

		// now some functions that handle types signatures, styling, and parsing

		/** constant that defines generated type name prefixes */
		GEN_NAME : "gen~",


		// type parsing
		isArrayType : function(typeName) {
			return typeName.substr(0, "Array.<".length) === "Array.<";
		},

		isFunctionOrConstructor : function(typeName) {
			return typeName.charAt(0) === "?" || typeName.charAt(0) === "*";
		},

		isPrototype : function(typeName) {
			return typeName.charAt(0) === "*" && typeName.substr( - protoLength, protoLength) === "~proto";
		},

		findReturnTypeEnd : function(fnType) {
			if (this.isFunctionOrConstructor(fnType)) {
				// walk the string and for every ? or *, find the corresponding :, until we reach the
				// : for the first ? or *
				var depth = 1;
				var index = 1;
				var len = fnType.length;

				while (index < len) {
					if (this.isFunctionOrConstructor(fnType.charAt(index))) {
						depth++;
					} else if (fnType.charAt(index) === ":") {
						depth--;
					}

					if (depth === 0) {
						// found it
						return index;
					}

					index++;
				}
			}
			return -1;
		},

		removeParameters : function(fnType) {
			var index = this.findReturnTypeEnd(fnType);			
			if (index >= 0) {
				return fnType.substring(0,index+1);
			}
			// didn't find a matching ":" (ie- invalid type)
			// or just not a function type
			return fnType;
		},

		/**
		 * if the type passed in is a function type, extracts the return type
		 * otherwise returns as is
		 */
		extractReturnType : function(fnType) {
			var index = this.findReturnTypeEnd(fnType);
			if (index >= 0) {
				return fnType.substring(1,index);
			}
			// didn't find a matching ":" (ie- invalid type)
			// or just not a function type
			return fnType;
		},

		/**
		 * returns a parameterized array type with the given type parameter
		 */
		parameterizeArray : function(parameterType) {
			return "Array.<" + parameterType + ">";
		},

		/**
		 * If this is a parameterized array type, then extracts the type,
		 * Otherwise object
		 */
		extractArrayParameterType : function (arrayType) {
			if (arrayType.substr(0, "Array.<".length) === "Array.<" && arrayType.substr(-1, 1) === ">") {
				return arrayType.substring("Array.<".length, arrayType.length -1);
			} else {
				return "Object";
			}
		},

		parseJSDocComment : function(docComment) {
			var result = { };
			result.params = {};
			if (docComment) {
				var commentText = docComment.value;
				try {
					var rawresult = doctrine.parse("/*" + commentText + "*/", {unwrap : true, tags : ['param', 'type', 'return']});
					// transform result into something more manageable
					var rawtags = rawresult.tags;
					if (rawtags) {
						for (var i = 0; i < rawtags.length; i++) {
							switch (rawtags[i].title) {
								case "typedef":
								case "define":
								case "type":
									result.type = rawtags[i].type;
									break;
								case "return":
									result.rturn = rawtags[i].type;
									break;
								case "param":
									// remove square brackets
									var name = rawtags[i].name;
									if (name.charAt(0) === '[' && name.charAt(name.length -1) === ']') {
										name = name.substring(1, name.length-1);
									}
									result.params[name] = rawtags[i].type;
									break;
							}
						}
					}
				} catch (e) {
					scriptedLogger.error(e.message, "CONTENT_ASSIST");
					scriptedLogger.error(e.stack, "CONTENT_ASSIST");
				}
			}
			return result;
		},

		/**
		 * Best effort to recursively convert from a jsdoc type specification to a scripted type name.
		 *
		 * See here: https://developers.google.com/closure/compiler/docs/js-for-compiler
		 * should handle:
				NullableLiteral
				AllLiteral
				NullLiteral
				UndefinedLiteral
				VoidLiteral
				UnionType
				ArrayType
				RecordType
				FieldType
				FunctionType
				ParameterType
				RestType
				NonNullableType
				OptionalType
				NullableType
				NameExpression
				TypeApplication
		 * @return {String} if the type is found, then return string, otherwise null
		 */
		convertJsDocType : function(jsdocType, env) {
			var allTypes = env.getAllTypes();
			if (!jsdocType) {
				return null;
			}

			var i;
			switch (jsdocType.type) {
				case 'NullableLiteral':
				case 'AllLiteral':
				case 'NullLiteral':
					return "Object";

				case 'UndefinedLiteral':
				case 'VoidLiteral':
					return "undefined";

				case 'UnionType':
					// TODO no direct handling of union types
					// for now, just return the first of the union
					if (jsdocType.elements && jsdocType.elements.length > 0) {
						return this.convertJsDocType(jsdocType.elements[0], env);
					}
					return "Object";

				case 'RestType':
					return "Array.<" + this.convertJsDocType(jsdocType.expression, env) + ">";
				case 'ArrayType':
					if (jsdocType.elements && jsdocType.elements.length > 0) {
						// assume array type is type of first element, not correct, but close enough
						return "Array.<" + this.convertJsDocType(jsdocType.elements[0], env) + ">";
					}
					return "Array";

				case 'FunctionType':
					var ret = this.convertJsDocType(jsdocType.result, env);
					if (!ret) {
						ret = "Object";
					}
					var params = [];
					if (jsdocType.params) {
						for (i = 0; i < jsdocType.params.length; i++) {
							// this means that if no name is used, then the type name is used (if a simple type)
							var param = jsdocType.params[i].name;
							if (!param) {
								param = 'arg'+i;
							}
							var paramType = "";
							if (jsdocType.params[i].expression) {
								paramType = "/" + this.convertJsDocType(jsdocType.params[i].expression, env);
							}
							params.push(param + paramType);
						}
					}
					// TODO FIXADE must also handle @constructor
					var funcConstr;
					if (jsdocType['new'] && jsdocType['this']) {
						// this is actually a constructor
						var maybeRet = this.convertJsDocType(jsdocType['this'], env);
						if (maybeRet) {
							ret = maybeRet;
						}
						funcConstr = "*";
					} else {
						funcConstr = "?";
					}
					return funcConstr + ret + ":" + params.join(',');

				case 'TypeApplication':
					var expr = this.convertJsDocType(jsdocType.expression, env);
					if (expr === "Array" && jsdocType.applications && jsdocType.applications.length > 0) {
						// only parameterize arrays not handling objects yet
						return "Array.<" + this.convertJsDocType(jsdocType.applications[0], env) + ">";
					}
					return expr;
				case 'ParameterType':
				case 'NonNullableType':
				case 'OptionalType':
				case 'NullableType':
					return this.convertJsDocType(jsdocType.expression, env);

				case 'NameExpression':
					var name = jsdocType.name;
					name = name.trim();
					if (allTypes[name]) {
						return name;
					} else {
						var capType = name[0].toUpperCase() + name.substring(1);
						if (allTypes[capType]) {
							return capType;
						}
					}
					return null;
				case 'RecordType':
					var fields = { };
					for (i = 0; i < jsdocType.fields.length; i++) {
						var field = jsdocType.fields[i];
						var fieldType = this.convertJsDocType(field, env);
						fields[field.key] = fieldType ? fieldType : "Object";
					}
					// create a new type to store the record
					var obj = env.newFleetingObject();
					for (var prop in fields) {
						if (fields.hasOwnProperty(prop)) {
							// add the variable to the new object, which happens to be the top-level scope
							env.addVariable(prop, obj, fields[prop]);
						}
					}
					return obj;
				case 'FieldType':
					return this.convertJsDocType(jsdocType.value, env);
			}
			return null;
		},

		// type styling
		styleAsProperty : function(prop, useHtml) {
			return useHtml ? "<span style=\"color: blue;font-weight:bold;\">" + prop + "</span>": prop;
		},
		styleAsType : function(type, useHtml) {
			return useHtml ? "<span style=\"color: green;font-weight:bold;\">" + type + "</span>": type;
		},
		styleAsOther : function(text, useHtml) {
			return useHtml ? "<span style=\"font-style:italic;\">" + text + "</span>": text;
		},

		/**
		 * creates a human readable type name from the name given
		 */
		createReadableType : function(typeName, env, useFunctionSig, depth, useHtml) {
			depth = depth || 0;
			var first = typeName.charAt(0);
			if (first === "?" || first === "*") {
				// a function
				var returnEnd = this.findReturnTypeEnd(typeName);
				if (returnEnd === -1) {
					returnEnd = typeName.length;
				}
				var funType = typeName.substring(1, returnEnd);
				if (useFunctionSig) {
					// convert into a function signature
					var prefix = first === "?" ? "" : "new";
					var args = typeName.substring(returnEnd+1, typeName.length);
					var argsSigs = [];
					var self = this;
					args.split(",").forEach(function(arg) {
						var typeSplit = arg.indexOf("/");
						var argName = typeSplit > 0 ? arg.substring(0, typeSplit) : arg;
						argName = self.styleAsProperty(argName, useHtml);
						var argSig = typeSplit > 0 ? arg.substring(typeSplit + 1) : "";

						if (argSig) {
							var sig = self.createReadableType(argSig, env, true, depth+1, useHtml);
							if (sig === "{  }") {
								argsSigs.push(argName);
							} else {
								argsSigs.push(argName + ":" + sig);
							}
						} else {
							argsSigs.push(argName);
						}
					});

					// note the use of the ⇒ &rArr; char here.  Must use the char directly since js_render will format it otherwise
					return prefix + "(" + argsSigs.join(", ") +
						(useHtml ? ")<br/>" + proposalUtils.repeatChar("&nbsp;&nbsp;", depth+1) + ": " : ") : ") +
						this.createReadableType(funType, env, true, depth + 1, useHtml);
				} else {
					// use the return type
					return this.createReadableType(funType, env, true, depth, useHtml);
				}
			} else if (typeName.indexOf(this.GEN_NAME) === 0) {
				// a generated object
				if (depth > 1) {
					// don't show inner types
					return this.styleAsOther("{...}", useHtml);
				}

				// create a summary
				var type = env.findType(typeName);
				var res = "{ ";
				var props = [];
				for (var val in type) {
					if (type.hasOwnProperty(val) && val !== "$$proto") {
						var name;
						// don't show inner objects
						name = this.createReadableType(type[val].typeName, env, true, depth + 1, useHtml);
						props.push((useHtml ? "<br/>" + proposalUtils.repeatChar("&nbsp;&nbsp;&nbsp;&nbsp;", depth+1) : "" ) +
							this.styleAsProperty(val, useHtml) + ":" + name);
					}
				}
				res += props.join(", ");
				return res + " }";
			} else if (this.isArrayType(typeName)) {
				var typeParameter = this.extractArrayParameterType(typeName);
				if (typeParameter !== "Object") {
					typeName = this.createReadableType(typeParameter, env, true, depth+1, useHtml) + "[]";
				} else {
					typeName = "[]";
				}
				return typeName;
			} else {
				return this.styleAsType(typeName, useHtml);
			}
		}
	};
}