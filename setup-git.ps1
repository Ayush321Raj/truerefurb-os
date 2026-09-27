$git = 'C:\Users\Ashim\AppData\Local\MinGit\cmd\git.exe'

Write-Host "1. Initializing Git repository with main branch..."
& $git init -b main

Write-Host "2. Configuring user identity..."
& $git config user.name "ashimchakraborty1993-commits"
& $git config user.email "ashimchakraborty1993@gmail.com"

Write-Host "3. Adding files to staging..."
& $git add .

Write-Host "4. Creating initial commit..."
& $git commit -m "Initial commit: TrueRefurb OS with Device Master, Warehouses, Purchases, Customers, Reference Billing Engine TR/26-27/097"

Write-Host "5. Setting remote origin..."
& $git remote remove origin -ErrorAction SilentlyContinue
& $git remote add origin "https://github.com/ashimchakraborty1993-commits/truerefurb-os.git"

Write-Host "Repository initialized and committed successfully!"
& $git log -1 --stat
