import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  name: string;
  status: string;
  version: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return {
      name: 'ahansk-backend',
      status: 'running',
      version: '1.0.0',
    };
  }
}
