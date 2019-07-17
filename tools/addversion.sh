#!/bin/bash
# file add version of package.json for current module
# author houyu01(houyu01@baidu.com)

echo "changing version $1"
if [ "$1" == "0" ];then
    npm version major
elif [ "$1" == "1" ];then
    npm version minor
elif [ "$1" == "2" ];then
    npm version patch
else
    echo "please input leagally version"
fi
