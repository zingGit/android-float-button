
/**
 * @class 任务队列
 */
export default class TaskQueue {

    private queue: Array<iTask> = []
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

        this.queue.length = 0
    }
    /**
     * @method 执行指定任务
     * @param taskId 
     * @param isRemove 是否移除
     * @returns 
     */
    public execTask(taskId: number, isRemove?: boolean) {

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

        const task = this.queue.shift()
        task?.callback(task.data)
    }
}


export interface iTask {
    taskId: number,
    callback: Function,
    data: any
}