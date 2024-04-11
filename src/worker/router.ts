import { Queue } from 'bull';
import { JobHandler } from './interface';

export class Router {
    static async register(): Promise<Queue[]> {
        const queues: JobHandler[] = [];
        queues.push();
        return Promise.all(queues.map((queue) => queue.register()));
    }
}
