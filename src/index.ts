import express, { Request, Response, NextFunction } from 'express';
import { AppDataSource } from './data-source';
import { User } from './entity/User';

const app = express();
const port = 4500;

// Middleware to log requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware to parse JSON
app.use(express.json());

// Initialize the TypeORM connection
AppDataSource.initialize().then(async () => {
  console.log('Connected to the database');

  // Get all users
  app.get('/users', async (req: Request, res: Response) => {
    try {
      const users = await AppDataSource.manager.find(User);
      console.log("Loaded users: ", users);
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get a single user by ID
  app.get('/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await AppDataSource.manager.findOne(User, {where: {id: userId}});
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Create a new user
  app.post('/users', async (req: Request, res: Response) => {
    try {
      const newUser = AppDataSource.manager.create(User, req.body);
      const result = await AppDataSource.manager.save(newUser);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Update a user by ID
  app.put('/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await AppDataSource.manager.findOne(User,  {where: {id: userId}});

      if (user) {
        AppDataSource.manager.merge(User, user, req.body);
        const result = await AppDataSource.manager.save(user);
        res.json(result);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Delete a user by ID
  app.delete('/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await AppDataSource.manager.findOne(User,  {where: {id: userId}});

      if (user) {
        const result = await AppDataSource.manager.remove(user);
        res.json(result);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((error) => console.log(error));
