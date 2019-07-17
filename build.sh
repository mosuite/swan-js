
npm install --registry http://registry.npm.baidu-int.com
npm run build
mkdir -p ./output/dist/box/
curPath=`pwd`
cd ./dist/box/
zip -r box.zip ./*
cd -
mv ./dist/box/box.zip output/dist/box/
cp package.json ./output
cp ./tools/removeScript.js ./output
cp ./.npmrc ./output
