---
title: softmax中的交叉熵损失
date: 2026-10-25 19:00:00
tags:
  - 深度学习
  - PyTorch
categories:
  - 学习笔记
---
交叉熵损失定义为模型为正确分类类别的概率越大，损失越小，反之则越大
在python代码中的实现如下
```python
def cross_entropy(y_hat, y):
    return - torch.log(y_hat[range(len(y_hat)), y])
```
这里的代码意思是先找到每个真实类别的概率，对其取对数在取相反数。
具体案列：
```python
y = torch.tensor([0, 2])
y_hat = torch.tensor([[0.1, 0.3, 0.6], [0.3, 0.2, 0.5]])
y_hat[[0, 1], y]
```
其中0，1其实就是range(len(y_hat))
其实用的是pytorch里的高级索引配对方式，相当于
y里面存了每一个样本正确对应的索引，y_hat里存的预测每个类别的概率
这样一对一的配对，刚好能得出每个样本正确类别的概率。