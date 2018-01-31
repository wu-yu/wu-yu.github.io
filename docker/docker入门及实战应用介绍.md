# docker简介
Docker是一个开源的引擎，可以轻松的为任何应用创建一个轻量级的、可移植的、自给自足的容器。可以将一个应用或者整个系统打包到docker容器里面，实现快速部署和运行。
![](../images/package_software.png)
## docker和虚拟机的区别
虚拟机是通过虚拟了一套 Guest OS和通过Hypervisor对虚拟机使用到的硬件资源进行协调和管理,而docker则是直接共享主机的操作系统的资源，只是进行了隔离。
![](../images/docker_vs_virtual_machine.png)   
更多阐述可见参考链接：[docker容器与虚拟机有什么区别？](https://www.zhihu.com/question/48174633)

## 为什么用docker
下面是个人对docker的优点的理解
- 一次构建，到处运行。    
- 快速部署。
- 节省资源。     
运行多个docker容器所花费的内存和空间资源是远远小于虚拟机的。内存占用从docker和虚拟机的区别明显可以判断出来。从空间方面来说，运行N个相同的大小为100M的docker容器，所占用的空间只是: 
100M(只读层数据，也就是原镜像数据) + (N × 少量可写层数据)    
可见参考文档：[docker多个容器运行时实际占用大小](https://github.com/docker/docker.github.io/issues/1520#issuecomment-305179362)       

# docker安装
请见[docker安装](docker安装.md)

# docker基本概念
- docker镜像  
Docker 镜像是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。镜像不包含任何动态数据，其内容在构建之后也不会被改变。
- docker容器  
镜像（Image）和容器（Container）的关系，就像是面向对象程序设计中的 类 和 实例 一样，镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。       
容器存储层的生存周期和容器一样，容器消亡时，容器存储层也随之消亡。因此，任何保存于容器存储层的信息都会随容器删除而丢失。
- docker仓库      
类似于maven repository，用于提供docker镜像的发布和分发。

# docker指令
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
注意docker的默认地址是`192.168.99.100`，访问这个地址的`8080`端口，可以看见运行结果：      
![](../images/20180129164017.png)       

如果容器已经通过`docker run`新建并运行过了，下次要再启动，只需使用`docker start`。

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

其他指令，在这里就不再描述了，请在需要用到时查阅网上文档即可。

# docker镜像创建
docker镜像可以通过两种方式来创建。        
- 一种是在利用`docker exec`指令进入运行的容器，对容器进行修改后，通过`docker commit`指令，将修改过的容器提交成一个新的镜像。     
- 另一种是使用`Dockerfile`脚本，用`docker build`指令构建。   
## Dockerfile介绍
Dockerfile是由Dockerfile指令编写的一个脚本文件，可以通过Dockfile指令指定docker的基础镜像，将打包docker镜像需要的资源文件复制到docker镜像，指定docker容器运行时执行的命令等等。       
**官方文档地址**：[Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
### Dockerfile指令简介
指令名称     | 作用     
------      |  -------  
RUN         | 执行Linux命令
COPY        | 复制文件
ADD         | 更高级的复制文件，会自动解压复制的文件，推荐需要自动解压缩的场合使用ADD 
CMD         | 容器启动命令        
ENTRYPOINT  | 入口点，默认为`/bin/sh -c`
ENV         | 设置环境变量
USER	    | 指定当前用户
WORKDIR	    | 指定工作目录
EXPOSE	    | 声明端口
VOLUME	    | 定义匿名卷     

CMD和ENTRYPOINT的区别：ENTRYPOINT指定一个容器启动的时候始终会执行的命令，而CMD则指定对ENTRYPOINT的补充参数。      
**官方解释**：[Understand how CMD and ENTRYPOINT interact](https://docs.docker.com/engine/reference/builder/#understand-how-cmd-and-entrypoint-interact)
### Dockerfile构建spring应用镜像
1.在spring工程根目录下创建Dockerfile文件。
```
FROM tomcat:8
ADD target/hello-world.war /usr/local/tomcat/webapps/
CMD ["catalina.sh", "run"]
```
2.运行maven对工程进行打包，打包完成后，运行docker build命令：
```
$ docker build -t spring_demo .
```
![](../images/20180130141618.png)
docker打包成功,从体积上可以看出，spring_demo比基础镜像tomcat大了54M，差不多就是war包的体积大小。      
![](../images/20180130143132.png)
通过下面命令运行
```
$ docker run -d -p 8080:8080 spring_demo
```
### Dockerfile构建spring boot应用镜像
1.在spring boot 工程根目录下，创建Dockerfile文件。
内容如下：

```
FROM frolvlad/alpine-oraclejdk8:slim
VOLUME /tmp
ADD target/yourPackage.jar app.jar
ENV JAVA_OPTS=""
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar /app.jar" ]
```
其中`yourPackage.jar`是spring boot工程经过maven插件`spring-boot-maven-plugin`打包后生成的jar包名。

2.docker build 命令构建镜像    
运行docker terminal,cd到工程根目录，如cd /C/Projects/mySpringServer/,运行：
```
docker build -t companyName/yourImageName:versionNumber .
```
如果没有提示错误，则成功创建了一个名字为`companyName/yourImageName`,版本为`versionNumber`的本地镜像。
可以通过`docker images`命令查看该镜像是否在镜像列表里面。

3.docker run命令运行
```
docker run -e "SPRING_PROFILES_ACTIVE=dev" -p 8081:8081 -t companyName/yourImageName:versionNumber
```
其中`8081：8081`，第一个端口指的是应用在docker运行的端口，第二个端口指的是docker映射到宿主机上的端口。
## docker仓库

# 参考文档
- [Docker — 从入门到实践（中文gitbook)](https://yeasy.gitbooks.io/docker_practice/introduction/)
- [官方：Docker Command-Line Interfaces reference](https://docs.docker.com/engine/reference/run/)
- [官方：Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
- [docker容器与虚拟机有什么区别？](https://www.zhihu.com/question/48174633)
- [docker多个容器运行时实际占用大小](https://github.com/docker/docker.github.io/issues/1520#issuecomment-305179362)