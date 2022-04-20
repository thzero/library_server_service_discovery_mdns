rmdir /s /q node_modules
del package-lock.json
call ncu -u
call npm i