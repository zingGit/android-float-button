cd ../

echo  '-------start build version-------'

read -p "请输入版本号(例:1.0.1)" version
echo $version

test=hotupdate-res-test
stage=hotupdate-res-stage
prod=hotupdate-res-prod
test_path=build/android/$test
stage_path=build/android/$stage
prod_path=build/android/$prod

rm -rf $test_path
rm -rf $stage_path
rm -rf $prod_path

echo  '-------copy assets file-------'
cp -r build/android/data $test_path
cp -r build/android/data $stage_path
cp -r build/android/data $prod_path
# 内网测试服235
echo '------start build test235------------'
node base_generator.js -s $test_path && node version_generator.js -u http://192.168.0.37:8000/ -s $test_path -d $test_path -v $version
# node base_generator.js -s $test_path && node version_generator.js -u http://192.168.0.235:29108/master/ -s $test_path -d $test_path -v $version
# 外网测试服
echo '------start build stage------------'
node base_generator.js -s $stage_path && node version_generator.js -u https://api.fbdln.info/master/ -s $stage_path -d $stage_path -v $version
# 正式服
echo '------start build prod------------'
node base_generator.js -s $prod_path && node version_generator.js -u https://drexvh8lepy2x.cloudfront.net/ -s $prod_path -d $prod_path -v $version


cd build/android/
echo '----------start compress version file----------'
zip -q -r $test-v$version.zip $test
zip -q -r $stage-v$version.zip $stage
zip -q -r $prod-v$version.zip $prod

echo '----------move version file to version folder--------'

mkdir -p ../../version

mv $test-v$version.zip ../../version/
mv $stage-v$version.zip ../../version/
mv $prod-v$version.zip ../../version/





# cd ../

# echo  '-------start-------'

# read -p "请输入构建类型(dev stage prod)" type
# echo $type

# read -p "请输入版本号：" version
# echo $version


# if [ "$type" == "dev" ];then
#     echo "build dev"
#     node base_generator.js -s build/android/data && node game_generator.js -s build/android/data -u http://192.168.0.235:29108/master/remote && node version_generator.js -u http://192.168.0.235:29108/master/ -s build/android/data/ -d ./build/android/data/ -v $version

# elif [ "$type" == "stage" ];then
#     echo "build stage"
#     node base_generator.js -s build/android/data && node game_generator.js -s build/android/data -u https://api.fbdln.info/master/remote && node version_generator.js -u https://api.fbdln.info/master/ -s build/android/data/ -d ./build/android/data/ -v $version

# elif [ "$type" == "prod" ];then
#     echo "build prod"
#     node base_generator.js -s build/android/data && node game_generator.js -s build/android/data -u https://api.dbvkv.site/master/remote && node version_generator.js -u https://api.dbvkv.site/master/ -s build/android/data/ -d ./build/android/data/ -v $version
# else
#     echo "构建版本错误，请输入构建类型(dev stage prod)"

# fi


# cd build/android/

# zip -q -r hotupdate-res-$type.zip data
