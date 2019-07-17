git config commit.template ci_template
git config --global commit.template ci_template
git config --global core.editor vim

if [ -f .git/hooks/prepare-commit-msg ];then
rm .git/hooks/prepare-commit-msg
fi

if [ ! -f $.git/hooks/commit-msg ];then
cp commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg
exit 0
fi