@echo off
if "%~1"=="" (
    echo Drag an .obj file onto this bat file.
    pause
    exit /b
)
python "%~dp0obj_to_bazis.py" "%~1"
echo.
pause
