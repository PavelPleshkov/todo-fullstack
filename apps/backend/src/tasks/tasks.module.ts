import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';

@Module({
  imports: [AuthModule],
  providers: [TasksService, TasksResolver],
  exports: [TasksService],
})
export class TasksModule {}
