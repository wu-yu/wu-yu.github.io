# docker简介
Docker是一个开源的引擎，可以轻松的为任何应用创建一个轻量级的、可移植的、自给自足的容器。可以将一个应用或者整个系统打包到docker容器里面，实现快速部署和运行。
![](../images/package_software.png)
## docker和虚拟机的区别
虚拟机是通过虚拟了一套 Guest OS和通过Hypervisor对虚拟机使用到的硬件资源进行协调和管理,而docker则是直接共享主机的操作系统的资源，只是进行了隔离。
![](../images/docker_vs_virtual_machine_.jpg)   
更多阐述可见参考文档：[docker容器与虚拟机有什么区别？](https://www.zhihu.com/question/48174633)

## 为什么用docker
下面是个人对docker的优点的理解
- 一次构建，到处运行。    
- 快速部署。
- 节省资源。     
运行多个docker容器所花费的内存和空间资源是远远小于虚拟机的。内存占用从docker和虚拟机的区别明显可以判断出来。从空间方面来说，运行N个相同的大小为100M的docker容器，所占用的空间只是: 
100M(只读层数据，也就是原镜像数据) + (N × 少量可写层数据)    
可见参考文档：[docker多个容器运行时实际占用大小](https://github.com/docker/docker.github.io/issues/1520#issuecomment-305179362)       

## docker安装
请见[docker安装](docker安装.md)

## docker基本概念
- docker镜像  
Docker 镜像是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。镜像不包含任何动态数据，其内容在构建之后也不会被改变。
- docker容器  
镜像（Image）和容器（Container）的关系，就像是面向对象程序设计中的 类 和 实例 一样，镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。       
容器存储层的生存周期和容器一样，容器消亡时，容器存储层也随之消亡。因此，任何保存于容器存储层的信息都会随容器删除而丢失。
- docker仓库      
类似于maven repository，用于提供docker镜像的发布和分发。

## docker指令
日常主要使用`镜像`、`容器`这两类指令。
官方文档地址：[https://docs.docker.com/engine/reference/run/](https://docs.docker.com/engine/reference/run/)       

下面我们以`spring boot`的官方docker例子来对docker指令做个演示。     

1.**查询镜像**      
`docker search docker_image_name`
![](../images/query_docker_image.png)

2.**获取镜像**      
 `docker pull docker_image_name:version`     
![](../images/docker_pull.png)

**查看镜像列表**      
`docker images`     
![](../images/docker_images.png)

3.**用镜像新建一个容器并且运行容器**       
`docker run -it -p 8080:8080 docker_image_name/docker_image_id`     
常用参数说明：       
-d 让容器在后台运行     
-i 在新容器内指定一个伪终端或终端      
-t 允许你对容器内的标准输入 (STDIN) 进行交互        
-p 将容器内部使用的网络端口映射到我们使用的主机上
![](../images/20180129163542.png)
通过`192.168.99.100`这个地址访问`8080`端口，可以看见运行结果：      
![](../images/20180129164017.png)       

4.**查看容器**      
`docker ps -a`     
运行`docker run -d 3a7a85f42b64`再创建一个在后台运行的容器，然后运行`docker ps -a`查看所有的容器。      
![](../images/20180129171504.png)

5.**进入运行中的容器**      
`docker exec -it [container id] /bin/sh`       
![](../images/20180129172108.png)

6.**查看容器的运行command**        
查看指定的：`docker inspect -f "{{.Path}} {{.Args}} ({{.Id}})" containerID`     
或查看全部的：`docker inspect -f "{{.Path}} {{.Args}} ({{.Id}})" $(docker ps -a -q)`
![](../images/20180129173350.png)

# 参考文档
- [docker容器与虚拟机有什么区别？](https://www.zhihu.com/question/48174633)
- [docker多个容器运行时实际占用大小](https://github.com/docker/docker.github.io/issues/1520#issuecomment-305179362)
- [Docker — 从入门到实践（中文gitbook)](https://yeasy.gitbooks.io/docker_practice/introduction/)