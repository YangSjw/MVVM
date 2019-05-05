class Dep{
    constructor(){
        this.watcherArr = []
    }
    addWatch(obj){
        this.watcherArr.push(obj)
    }
    changeWatch(){
        console.log(this.watcherArr)
        this.watcherArr.forEach(item => {
            item.sendVal()
        })
    }
}

Dep.target = null;
let dep = new Dep();


class Watcher{
    constructor(data,key,cbk){
        Dep.target = this
        this.data = data;
        this.key = key;
        this.cbk = cbk;
        // console.log(cbk)
        this.init()
    }
    init(){
        this.value = Utils.getVal(this.data,this.key)
        // console.log(this.value)
        Dep.target = null;
        return this.value
    }
    sendVal(){
        let newVal = this.init()
        // console.log(this.value)
        this.cbk(newVal)
    }
}


class Observer{
    constructor(data){
        // 如果data不是对象类型，跳出
        if(!data || typeof data !== 'object'){
            return
        }
        this.data = data
        this.init()
    }
    init(){
        Object.keys(this.data).forEach(item => {
            this.observer(this.data,item,this.data[item])
        })
    }
    observer(obj,key,val){
        new Observer(obj[key])
        Object.defineProperty(obj,key,{
            get(){
                console.log(Dep.target)
                if(Dep.target){
                    // console.log(Dep.target)
                    dep.addWatch(Dep.target)
                }
                return val
            },
            set(newVal){
                // console.log(newVal)
                // 如果新值与旧值相同，跳出
                if(val === newVal){
                    return;
                }
                val = newVal
                dep.changeWatch()
                //如果改变为对象
                new Observer(val)
                // return val
            }
        })
    }
}



// 给碎片赋值
const Utils =  {
    setVal(data,node,key){
        // console.dir(node)
        node.value = this.getVal(data,key)
    },
    getVal(data,key){
        if(key.indexOf('.') > -1){
            let arr = key.split('.');
            for(var i = 0 ; i < arr.length ; i++){
                data = data[arr[i]]
            }
            return data
        }else{
            return data[key]
        }
    },
    getText(data,node,key){
        // console.dir(node)
        node.textContent = this.getVal(data,key)
    },
    changeVal(data,key,newVal){
        console.log(data,key,newVal)
        if(key.indexOf('.') > -1){
            let arr = key.split('.');
            // console.log(arr[arr.length-1])
            for(var i = 0 ; i < arr.length-1 ; i++){
                data = data[arr[i]]
            }
            data[arr[arr.length-1]] = newVal
            // console.log(data[arr[arr.length-1]])
        }else{
            return data[key] = newVal
        }
    }
}



class Mvvm{
    constructor({el,data}){
        this.el = el;
        this.data = data;
        this.init()
        this.getdom()
    }
    init(){
        Object.keys(this.data).forEach(item => {
            this.observer(this.data,item,this.data[item])
        })
        new Observer(this.data)
    }
    observer(obj,key,val){
        Object.defineProperty(obj,key,{
            get(){
                return val
            },
            set(newVal){
                val = newVal
            }
        })
    }
    getdom(){
        this.$el = document.getElementById(this.el)
        let frame = this.frame()
        this.complice(frame)
        this.$el.appendChild(frame)
    }
    // 将dom结构创建碎片
    frame(){
        let newFrame = document.createDocumentFragment()
        while(this.$el.firstChild){
            newFrame.appendChild(this.$el.firstChild)
        }
        return newFrame
    }
    //遍历碎片结构，找到标签的v-model属性
    complice(node){
        if(node.nodeType === 1){
            let attributes = node.attributes
            Array.from(attributes).forEach(item => {
                if(item.nodeName === 'v-model'){
                    node.addEventListener('input',(e) => {
                        // console.log(e.target.value)
                        Utils.changeVal(this.data,item.nodeValue,e.target.value)
                    })
                    Utils.setVal(this.data,node,item.nodeValue)
                }
            })
        }else if(node.nodeType === 3){
            console.log(node)
            if(node.data && node.data.indexOf('{{') > -1){
                let key = node.data.split('{{')[1].split('}}')[0]
                Utils.getText(this.data,node,key)
                // console.log(key)
                new Watcher(this.data,key,(newVal) => {
                    // console.log(newVal)
                    node.textContent = newVal
                })
            }
        }
        //是否是最低级的子元素
        if(node.childNodes && node.childNodes.length > 0){
            //console.dir(node.childNodes)
            node.childNodes.forEach(item => {
                this.complice(item)
            })
        }
    }
}

