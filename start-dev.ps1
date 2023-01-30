
#Start-Service and sc.exe only succeed as admin
#I think it's because MySQL insisted to install itself as admin (the whole folder requires admin privileges to edit)
#Start-Service -DisplayName MySQL80
#sc.exe start MySQL80
if ((Get-Service -Name MySQL80).Status -eq "Stopped")
{
    Start-Process -Verb runas -FilePath "sc.exe" -ArgumentList "start MySQL80";
}

$ShellObject = (New-Object -ComObject "Shell.Application");
$ShellObject.ShellExecute("firefox", "-url localhost:3000 -devtools");
#$ShellObject.ShellExecute("firefox", "-url localhost:3000/admin.html -devtools");

npm start;
