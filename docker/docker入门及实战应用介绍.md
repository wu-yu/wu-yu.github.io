# docker简介
Docker是一个开源的引擎，可以轻松的为任何应用创建一个轻量级的、可移植的、自给自足的容器。可以将一个应用或者整个系统打包到docker容器里面，实现快速部署和运行。
![](../images/package_software.png)
## docker和虚拟机的区别
虚拟机是通过虚拟了一套 Guest OS和通过Hypervisor对虚拟机使用到的硬件资源进行协调和管理,而docker则是直接共享主机的操作系统的资源，只是进行了隔离。
![](../images/docker_vs_virtual_machine_.jpg)，更多阐述可见参考文档：`docker容器与虚拟机有什么区别？`

## 为什么用docker
下面是个人对docker的优点的理解
- 一次构建，到处运行。    
- 快速部署。
- 节省资源。     
运行多个docker容器所花费的内存和空间资源是远远小于虚拟机的。内存占用从docker和虚拟机的区别明显可以判断出来。从空间方面来说，运行N个相同的大小为100M的docker容器，所占用的空间只是: 
100M(只读层数据，也就是原镜像数据) + (N × 少量可写层数据),可见参考文档：`docker多个容器运行时实际占用大小`       

## docker安装
请见[docker安装](docker安装.md)

## 

# 参考文档
- [docker容器与虚拟机有什么区别？](https://www.zhihu.com/question/48174633)
- [docker多个容器运行时实际占用大小](https://github.com/docker/docker.github.io/issues/1520#issuecomment-305179362)
