#!/bin/sh
npmpublish() {
    resFlag=0;
    npm publish && resFlag=1
    if [ "$resFlag" = "1" ]
    then
        echo 'publish success!!!'
    else
        echo 'publish failed!!!'
        # echo 'republishing!!!'
        # oldVersion=`cat package.json | grep -oP 'version.*[0-9]*\.[0-9]*\.[0-9]*' | grep -oP '[0-9]*$'`
        # newVersion=$((oldVersion + 1));
        # sed -ir "s/(version.*[0-9]*\.[0-9]*\.)([0-9]*)\"/\1$newVersion\"/" package.json
    fi
}

npmpublish
