read -p '请输入要上传的版本号' version

cd ../version

echo '-----------开始传输-----------'
filename=hotupdate-res-stage-v$version.zip

if [ ! -f $filename ];then
    echo ------未找到$filename---------
    exit
fi

sshpass -p reddKPZK7640 scp -P 33209 $filename root@154.204.45.214:/var/www/master

echo "上传完成"
