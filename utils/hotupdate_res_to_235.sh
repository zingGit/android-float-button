read -p '请输入要上传的版本号' version

cd ../version

echo '-----------开始传输-----------'
filename=hotupdate-res-test-v$version.zip

if [ ! -f $filename ];then
    echo ------未找到$filename---------
    exit
fi

sshpass -p 123456 scp -P 22 $filename root@192.168.0.235:/var/www/kron/assets

echo "上传完成"
