# zflow


## 分支命名

* `next` 分支：下一版将上线的分支，不在下一版上线的功能不要合并到此分支。`feature` 分支先合并到此分支，解决掉冲突，供测试人员、产品经理测试通过后，准备上线。 
* `preview` 分支：预览分支，不在下一版上线的功能发布到这个分支供产品经理预览。这个分支不会合并到 `master` 分支，可以随便玩，坏了就 reset 到 `next` 分支状态。
* `master` 分支：主分支，`hotfix` 和 `feature` 分支都从此分支 checkout 出来。
* `vMAJOR.MINOR` 分支： 版本分支，比如 v0.1、v2.0。
* `feature/*` 分支： 功能分支，在此分支上开发新功能。
* `hotfix/*` 分支： bug修复分支，在此分支上修复bug。


## 新功能开发

1. 创建新功能分支
```sh
yarn zflow create feature <name>
```

2. 开发

3. 完成新功能分支
```sh
yarn zflow finish feature [names..]
```

4. 预发布
```sh
yarn zflow preprelease next
```

5. 发布
```sh
yarn zflow release next
```


## Bug修复

1. 创建bug修复分支
```sh
yarn zflow create hotfix <name>
```

2. 修复

3. 完成bug修复分支
```sh
yarn zflow finish hotfix [names..]
```

4. 预发布
```sh
yarn zflow preprelease hotfix
```

5. 发布
```sh
yarn zflow release hotfix
```


## CLI

### create
```sh
yarn zflow create <type> <name>
```

type:
- feature: 创建 `feature` 分支
- hotfix: 创建 `hotfix` 分支

执行操作:

```sh
git checkout master
git checkout -b <type>/<name>
git push -u origin <type>/<name>
```


### finish

```sh
yarn zflow finish <type> [names...] [--temp]
```

type:
- current: 合并当前所在分支(`feature` 或 `next`)至 `next` 分支
- feature: 合并 `feature` 分支至 `next` 分支
- hotfix: 合并 `hotfix` 分支至 `vMAJOR.MINOR` 分支、`next` 分支和 `master` 分支

temp: 仅合并 `hotfix` 分支至 `vMAJOR.MINOR` 分支（临时修复，不合入下一个版本）

执行操作:
```sh
# targetBranch = type === 'next' ? 'next' : 'latest'
# newVersion = type === 'next' ? 'minor' : 'patch'

git push
zflow checkout <targetBranch>
git pull
git merge [names...] -m "Merge [names...] into <targetBranch>"
git push

# only if type is hotfix and without option temp, following commands will be executed 

git checkout master
git pull
git merge [names...] -m "Merge [names...] into master"
git push
git checkout next
git pull
git merge master -m "Merge master into next"
git push
```


### prerelease

```sh
yarn zflow prerelease <type>
```

type:
- next: 发布 `next` 分支至灰度环境
- hotfix: 发布 `vMAJOR.MINOR` 分支至灰度环境

执行操作:

```sh
# targetBranch = type === 'next' ? 'next' : 'latest'
# newVersion = firstTimePrerelease ? 'prerelease' : type === 'next' ? 'preminor' : 'prepatch'

zflow checkout <targetBranch> 
git pull
npm version <newVersion>
git push
git push --tags
```


### release

```sh
yarn zflow release <type>
```

type:
- next: 发布 `next` 分支至生产环境
- hotfix: 发布 `vMAJOR.MINOR` 分支至生产环境

执行操作:

```sh
# targetBranch = type === 'next' ? 'next' : 'latest'
# newVersion = type === 'next' ? 'minor' : 'patch'

zflow checkout <targetBranch>
git pull
npm version <newVersion>
git push
git push --tags

# only if type is next, following commands will be executed 
# latestVersion is generated from version in package.json

git checkout master
git pull
git merge next -m "Merge next into master"
git push
git checkout -b <latestVersion>
git push -u origin <latestVersion>
```
