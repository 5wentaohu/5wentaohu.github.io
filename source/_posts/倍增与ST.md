---
title: 倍增与ST
date: 2026-10-16 20:40:29
tags:
  - 倍增
  - ST表
categories:
  - 算法学习
---
##### 倍增加贪心的国旗计划
洛谷p4155
```C++
#include<bits/stdc++.h>
using namespace std;
const int N=4e5+1;
int n,m;
struct warrior{
    int id,L,R;
    bool operator<(const warrior b)const {return L<b.L;}
}w[2*N];
int n2;
int go[N][20];
int res[N];
void init()
{
    int nxt=1;
    for(int i=1;i<=n2;i++){
        while(nxt<=n2&&w[nxt].L<=w[i].R)
        nxt++;
        go[i][0]=nxt-1;
    }
    for(int i=1;(1<<i)<=n;i++){
        for(int s=1;s<=n2;s++)
        go[s][i]=go[go[s][i-1]][i-1];
    }
}
void get(int x)
{
    int len=w[x].L+m,cur=x,ans=1;
    for(int i=log2(N);i>=0;i--){
        int pos=go[cur][i];
        if(pos&&w[pos].R<len){
            ans+=1<<i;
            cur=pos;
        }
    }
    res[w[x].id]=ans+1;
}
int main()
{
    scanf("%d%d",&n,&m);
    for(int i=1;i<=n;i++){
        w[i].id=i;
        scanf("%d%d",&w[i].L,&w[i].R);
        if(w[i].R<w[i].L)w[i].R+=m;
    }
    sort(w+1,w+n+1);
    //将数据长度扩展成两倍长度，来模拟环中的实际情况。 
    n2=n;
    for(int i=1;i<=n;i++){
        n2++;w[n2]=w[i];w[n2].L+=m;w[n2].R+=m;
    }
    init();
    for(int i=1;i<=n;i++)get(i);
    for(int i=1;i<=n;i++)printf(" %d",res[i]);
    return 0;
}
```
这道题先通过化圈为线的方法把环给拆掉，将环的数据复制一遍然后放到线性数组上，比如12345五个编号的人变成1234512345，因为原本在环里是5下面是1.
然后对于每个战士所走动的区间按左端点排序，因为他们区间不包含，所有右端点也会成为有序状态。
通过贪心找一个区间的下一个最优区间，合法区间为左端点小于上一个区间的右端点，右端点又要最远。
这样一个一个找过于慢，所以我们可以使用倍增的方法，可以找下2的0次方，2的一次方，2的2次方个区间
只需要通过go[s][i]=go[go[s][i-1]][i-1]这一递推公式来求得，存储的值是排完序的w的索引，代表的意思是从当前位置走2的i区间所到达的战士编号。
最后通过遍历每一个战士作为起始点，然后求取log2（N）为最大数逐渐减小，并且每次都把走过的区间累加到ans里，直到最后一个战士区间的右端点离终点差1（防止跳过终点，所以索性让其停在终点前一个位置），再ans+1就是答案。

##### ST算法
以洛谷2880为例子
```C++
#include<bits/stdc++.h>
using namespace std;
const int N=5e4+5;
int dp_min[N][20];int dp_max[N][20];
int n,q;
int res[N];int lg2[N];
void st_init()
{
    lg2[0]=-1;
    for(int i=1;i<=n;i++) lg2[i]=lg2[i>>1]+1;
    for(int i=1;i<=n;i++){
        dp_min[i][0]=res[i];
        dp_max[i][0]=res[i];
    }
    int p=lg2[n];
    for(int k=1;k<=p;k++){
        for(int s=1;s+(1<<k)<=n+1;s++){
            dp_max[s][k]=max(dp_max[s][k-1],dp_max[s+(1<<(k-1))][k-1]);
            dp_min[s][k]=min(dp_min[s][k-1],dp_min[s+(1<<(k-1))][k-1]);
        }
    }
}
int query(int a,int b)
{
    int x,y;
    int k=lg2[b-a+1];
    x=max(dp_max[a][k],dp_max[b-(1<<k)+1][k]);
    y=min(dp_min[a][k],dp_min[b-(1<<k)+1][k]);
    return x-y;
}
int main()
{
    cin>>n>>q;
    for(int i=1;i<=n;i++)cin>>res[i];
    st_init();
    for(int i=0;i<q;i++){
        int a,b;cin>>a>>b;
        cout<<query(a,b)<<endl;
    }
    return 0;
}
```
ST算法的使用来解决区间查询的问题，基本思想是一个区间的最值可以有他完全包含的两个区间来求，
例如1234的最大值可以看作12和34里面的最大值。这样的区间长度迭代方式我们用到了倍增的思想，用dp【s】【k】表示以s作为起点，2的k次方为长度的区间，要明白的是，这样的存储方式是由递推公式得来的，
 dp_max[s][k]=max(dp_max[s][k-1],dp_max[s+(1<<(k-1))][k-1]);
  dp_min[s][k]=min(dp_min[s][k-1],dp_min[s+(1<<(k-1))][k-1]);
 这是定义时的存储，这个时候我们的大区间是由小区间拼接而来的。
 <mark>需要注意的是，当我们使用这个dp来求解的时候是不一样的</mark>
  x=max(dp_max[a][k],dp_max[b-(1<<k)+1][k]);
  y=min(dp_min[a][k],dp_min[b-(1<<k)+1][k]);
  可以看到这时候我们的第二个区间是从右端点往前推的，这样才能保证这两个小区间都是被大区间包含的。