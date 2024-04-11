import { Job, DoneCallback, Queue } from 'bull';

export interface JobHandler {
    register(): Promise<Queue>;
    handler(job: Job, done: DoneCallback): Promise<void>;
}

export interface RefreshJobData {
    job?: string;
    command: string;
}

export interface InfoStat {
    moderator_id: number;
    time: number; // start of week
}

export interface TimeData {
    start: number;
    end: number;
}
