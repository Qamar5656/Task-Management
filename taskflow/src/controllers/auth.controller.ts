import { Request, Response } from 'express';

export const authController = {
  testController: (req: Request, res: Response) => {
    res.json({ message: "Auth route is working with TypeScript!" });
  }
};
