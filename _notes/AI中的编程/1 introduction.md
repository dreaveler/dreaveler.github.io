---
number: 1
title: "1 introduction"
subject: AI中的编程
date: 2025-9-10
---
# 基本信息  
分数构成：8*10 + 20 + 5 = 105  
大作业额外有5point的bonus  
课程考勤：0次/1次  5point bonus  
课程内容：PyTorch的使用以及深度学习框架背后的原理  
# 课程背景与内容介绍
## Appliactions of Deep Learning
- AlexNet  
- AlphaGo  
- StyleGAN  
- AlphaFold 2  
- ChatGPT  
- Stable Diffusion  

## The Driving Forces of Deep Learning
### Large Scale DataSets
- MNIST  
- ImageNet  
- LAION  

### Computations
### Deep Neural Networks
## 课程大纲
- 并行编程 CUDA  
- 自动微分与计算图  python  
- 分布式计算简介  

# 第一个Pytroch程序
## Data Representation in PyTorch
the tensor in pytorch is a multidimentional array
```python
import torch
import numpy as np
data = [[1,2],[3,4]]
x_data = torch.tensor(data)

np_array = np.array(data)
x_np = torch.from_numpy(np_array)

x_rand = torch.rand_like(x_data,dtype = torch.float)
x_ones = torch.ones_like(x_data)

tensor = tensor.to('cuda')
```

## Load Data
```python
import torch
import torchvision

batch_size = 4
transform = torchvision.transforms.Compose([transforms.ToTensor(),transforms.Normalize((0.5,0.5,0.5),(0.5,0.5,0.5))])
trainset = torchvision.datasets.CIFAR10(root = './data',train= True, download=  True,transform = transform)
trainloader = torch.utils.data.DataLoader(trainset , batch_size = batch_size, shuffle = True,num_workers = 2) #pytorch实现的使CPU和GPU同时运作 异步实现

dataiter = iter(trainloader)
images,labels = next(dataiter)
```

## Implement LeNet
```python
class LeNet(torch.nn.Module):
    def __init__(self):
        super().init()
        self.conv1 = nn.Conv2d(3,6,5)
        self.pool = nn.MaxPool2d(2,2)
        self.conv2 = nn.Conv2d(6,16,5)
        self.fc1 = nn.Linear(16 * 5 * 5,120)
        self.fc2 = nn.Linear(120,84)
        self.fc3 = nn.Linear(84,10)

    def forward(self,x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = torch.flatten(x,1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x
```

## Auto-Differentiation in PyTorch
```python
net = Net()
input = torch.randn(1,1,32,32)
out = net(input)

params = list(net.parameters())

criterion = nn.CrossEntropyLoss()
loss = criterion(out,target)

net.zero_grad()
loss.backard(torch.randn(1,10))
```

## Optimization in Pytorch
```python
lr,weight_decay = 0.001,0.005
for weights in net.parameters():
    grad = weights.grad + 2 * weights * weight_decay
    weight_data = weights - grad * lr
```

## Distributed Computation
