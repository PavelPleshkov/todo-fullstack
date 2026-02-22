import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks/task.entity';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'todo_user',
      password: 'todo_pass',
      database: 'todo_db',
      entities: [Task],
      synchronize: true,
      logging: ['query', 'error'],
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
