
/**
 * @class 任务队列
 */
export default class TaskQueue {

    private queue: Array<iTask> = []

    /**
     * 
     * @param props 可以绑定一个任意数据
     */
    public constructor(private props?: any) {

    }

    public getProps() {
        return this.props
    }

    /**
     * @method 获取队列长度
     * @returns 
     */
    public getLength(): number {
        return this.queue.length
    }

    /**
     * @method 判断队列是否为空 
     * @returns 
     */
    public isEmpty(): boolean {
        return this.queue.length == 0
    }

    /**
     * @method 添加任务
     * @param task 
     */
    public add(task: iTask): void {

        this.queue.push(task)
    }
    /**
     * @method 移除指定任务
     * @param taskId 任务ID
     */
    public remove(taskId: number): void {

        const index = this.queue.findIndex( task => {
            return task.taskId === taskId
        })

        if(index !== -1) {
            this.queue.splice(index, 1)
        }
    }
    /**
     * @method 移除所有任务
     */
    public removeAll(): void {

        this.queue = []
    }
    /**
     * @method 执行指定任务
     * @param taskId 
     * @param isRemove 是否移除
     * @returns 
     */
    public exec(taskId: number, isRemove?: boolean) {

        const index = this.queue.findIndex( task => {
            return task.taskId === taskId
        })

        if(index === -1) {
            return
        }

        const task = this.queue[index]
        task.callback(task.data)

        isRemove && this.queue.splice(index, 1)
    }
    /**
     * @method 执行下一个任务
     */
    public next(): void {

        if(this.isEmpty()) return

        const task = this.queue.shift()
        task?.callback(task.data)
    }
}


export interface iTask {
    taskId: number,
    callback: Function,
    data: any
}