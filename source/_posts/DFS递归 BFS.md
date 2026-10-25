---
title: DFS递归 BFS
date: 2026-09-14 19:39:32
tags:
  - DFS
  - BFS
categories:
  - 算法学习
---
# 最大路径和
```C++
int maxGain(TreeNode* node){

    if(node==nullptr)return 0;

    int leftGain=max(maxGain(node->left),0);
    int rightGain=max(maxGain(node->right),0);

  
    int newpath=node->val+leftGain+rightGain;
    MaxSum=max(newpath,MaxSum);

    return node->val+max(leftGain,rightGain);

}
```
> 用左右贡献值来判断节点应该带左子树还是右子树，当前节点的最大路径和就是左右贡献值加上当前节点的值，在每次计算的时候都会将结果与值对比，以保证存储的结果是最大的值。
> 
## 利用dfs下棋子
```C++
void dfs(vector<dot>g,ll w)

{

    ans.insert(g);
    if(w==0){return ;}
    set<dot>memo;
    for(dot t:g){memo.insert(t);}
    for(dot t:g){
       for(ll i=0;i<4;i++)
        {
            ll nx=t.x+xx[i],ny=t.y+yy[i];
            if(memo.count({nx,ny})){continue;}
            vector <dot>tmp=g;
            tmp.push_back({nx,ny});
            dq(tmp);
            if(check(tmp)){dfs(tmp,w-1);}
        }
    }
}
```
用记忆数组记下每次落下棋子后的棋子图案，直到把棋子落完。

## BFS标记棋盘已有联通块
```C++
void bfs(dot d){
    queue<dot>q;q.push(d);
    vis[d.x][d.y]=1;
    while(q.size()){
        dot t=q.front();
        q.pop();
        for(ll i=0;i<4;i++){
            ll nx=t.x+xx[i],ny=t.y+yy[i];
            if(nx<1||nx>n||ny<1||ny>m){continue;}
            if(gh[nx][ny]==0||vis[nx][ny]){continue;}
            q.push({nx,ny});
            vis[nx][ny]=1;
        }
    }
```
用visited数组与BFS算法标记已有的所有联通块

### BFS的算法题
```C++
#include<bits/stdc++.h>
using namespace std;
const int MN=4e4+1;
vector<int>a[MN];
int TE,FE,S,TFE,T,F,N,M,x,y,ans=INT_MAX,RT[MN],RF[MN],RN[MN],V[MN];
void bfs(int start,int times,int arr[])
{
    queue<int>q;
    V[start]++;
    q.push(start);
    while(!q.empty()){
        x=q.front();
        q.pop();
        for(auto& y:a[x])
        {
            if(V[y]==times)continue;
            arr[y]=arr[x]+1;
            V[y]++;
            q.push(y);
        }
    }
}
int main( )
{
    cin>>TE>>FE>>S>>T>>F>>N>>M;
    TFE=TE+FE-S;
    for(int i=0;i<M;i++)
    {
        cin>>x>>y;
        a[x].push_back(y);a[y].push_back(x);
    }
    bfs(N,1,RN);
    if(!V[T]||!V[F]){
        cout<<-1;return 0;
    }
    bfs(T,2,RT);
    bfs(F,3,RF);
    for(int i=1;i<=N;i++)
    {
        if(V[i])
        ans=min(ans,RT[i]*TE+RF[i]*FE+RN[i]*TFE);
    }
    cout<<ans;
    return 0;
}
```
<mark>题目</mark>
今天是六一节，小度去公园玩，公园一共 NN 个景点，正巧看到朋友圈度度熊也在这个公园玩，于是他们约定好一块去景点 NN。 小度当前所在景点编号为 TT，从一个景点到附近的景点需要消耗的体力是 TETE，而度度熊所在景点编号为 FF ，移动消耗为 FEFE。 好朋友在一块，赶路都会开心很多，所以如果小度和度度熊一块移动(即在相同位置向相同方向移动)，每一步他俩的总消耗将会减少 SS。  
求他俩到景点 NN 时，所需要的总消耗最少是多少？
**提示**
根据题目可以把问题看做，两人于一个点集合，然后到达目标点，两人不汇合即是两人到点集合的特殊情况。
因此我们可以枚举两人到达每一个点的最小距离，通过代码中的bfs来求到每个点的最小路径。以目标点为起始点
可以排除两者到不了目标点的情况，然后再以两者起始点能分别表示出两者到任意点的距离，最后取最小就行了。
