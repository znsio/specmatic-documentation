mkdir source-repository
git init -q -b main source-repository
cp contracts/books.yaml source-repository/books.yaml
git -C source-repository add books.yaml
git -C source-repository -c user.name='Documentation Example' -c user.email=example@example.com commit -qm 'Add book contract'
git -C source-repository checkout -qb alternate
node -e "const fs=require('node:fs');const file='source-repository/books.yaml';fs.writeFileSync(file,fs.readFileSync(file,'utf8').replaceAll('Specmatic Handbook','Alternate Handbook'));"
git -C source-repository add books.yaml
git -C source-repository -c user.name='Documentation Example' -c user.email=example@example.com commit -qm 'Change the example on alternate'
git -C source-repository checkout -q main
echo 'Git source repository ready'
