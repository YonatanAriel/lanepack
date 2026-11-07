Set fso = CreateObject("Scripting.FileSystemObject")
repoRoot = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
ps1 = repoRoot & "\scripts\start-desktop.ps1"

Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = repoRoot
sh.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & ps1 & """", 0, False
