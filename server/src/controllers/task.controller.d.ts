import { Request, Response } from 'express'

export interface TaskController {
  getTasks: (req: Request, res: Response) => Promise<void>
  createTask: (req: Request, res: Response) => Promise<void>
  updateTask: (req: Request, res: Response) => Promise<void>
  deleteTask: (req: Request, res: Response) => Promise<void>
}

declare const taskController: TaskController
export default taskController 