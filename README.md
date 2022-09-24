todo
  semiconduct
    横屏
    词频树
    随机丰富词语

    chrome插件

    http://www.iciba.com/word?w=xxx



单字母词频
    ['q', 1441],
    ['j', 1504],
    ['x', 2722],
    ['z', 3556],
    ['w', 5955],
    ['k', 7066],
    ['v', 7702],
    ['f', 9988],
    ['b', 15529],
    ['y', 16718],
    ['g', 17951],
    ['h', 22678],
    ['d', 24196],
    ['p', 25564],
    ['m', 26271],
    ['u', 27945],
    ['c', 36935],
    ['l', 43401],
    ['s', 44948],
    ['n', 52468],
    ['t', 55872],
    ['r', 57991],
    ['o', 59304],
    ['i', 69156],
    ['a', 71460],
    ['e', 83986],


单字母词频 词头
    ['x', 171],
    ['y', 357],
    ['z', 451],
    ['q', 485],
    ['j', 881],
    ['k', 1218],
    ['v', 1594],
    ['w', 1822],
    ['n', 2337],
    ['o', 2400],
    ['u', 2832],
    ['g', 3158],
    ['l', 3273],
    ['f', 3564],
    ['i', 3719],
    ['h', 4087],
    ['e', 4206],
    ['r', 4380],
    ['b', 4795],
    ['t', 4975],
    ['d', 5135],
    ['m', 5340],
    ['a', 6683],
    ['p', 7901],
    ['c', 8891],
    ['s', 9720],

// 双字母词频
const x =2
const R = {}
Object.keys(temp1).forEach(word=>{
    if(word.length < x-1) return
    const res = Array.from(Array(word.length + 1 - x), (_,i)=>word.slice(i,i+x))
    res.forEach(r=>{
        if(!R[r]) R[r] = 0
        R[r]++
    })
})
Object.entries(R).sort((q,w)=>w[1]-q[1]).slice(0,100)
console.log(26**x, Object.entries(R).sort((q,w)=>w[1]-q[1]).length)






// 以头/尾x位为分割 排序
const x = 3
Object.entries(temp2.map(e=>e.slice(0,x)).reduce((all, now)=>{
    if(!all[now]) all[now] = 0
    all[now]++
    return all
},{})).sort((q,w)=>w[1]-q[1]).slice(0,100)


元音最多 aerobacteriological


最短不存在
cx

不同字母最多 15
encephalomyocarditis

重复字母最多 12
microspectrophotometer

单词长度最长 24
diphenylaminechlorarsine

最多单字母连续重复  /(\w)(\1)+/
brrr
最多相同多字母连续重复
appellee 
最多不同多字母连续重复
ahuehuete

最多单字母不连续重复  /.*(\w).*(.*\1.*){5+}/
taramasalata 
最多多字母不连续重复
hemidemisemiquaver


最长循环节
huggermugger

最多循环节  
dirigibility
berserker
amendment

最长回文 word.match(/(.)(.)(.)(.).*\4\3\2\1/) || ['']
levitative
最长纯粹回文
succus
最长纯粹回文2
reifier


含相同字母最多 abracadabra (a5)
temp2.map(word=>[Object.entries([...word].reduce((all,now,i,word)=>{
    window.s=word
    if(!all[now]) all[now]=0
    all[now]++
    return all
},{})).sort((q,w)=>w[0][1]-q[0][1])[0], word])
.sort((q,w)=>w[0][1]-q[0][1])




https://raw.githubusercontent.com/Zhangtd/MorTransformation/master/dic.txt
$0.innerText.split('\n').map(e=>{
    const r = e.replaceAll('', ' ').split(' ')
    return {[r[0]]: r.slice(1).join(' ')}
}).reduce((all,now)=>{
    const [k,v] = Object.entries(now)[0]
    all[k] =  v
    return all
},{})