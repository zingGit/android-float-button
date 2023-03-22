#上传远程 替换ngixn 配置

server_account=root
server_ip=192.168.0.235
server_pw=123456
file_path=/home/brazilclient
file_name=t.zip

cd ../build

echo ----------压缩中----------
zip -q -r t.zip web-desktop
echo ----------开始传输----------

sshpass -p $server_pw scp $file_name $server_account@$server_ip:$file_path

echo ----------传输完毕----------