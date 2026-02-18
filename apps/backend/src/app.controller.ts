import { Controller, Get } from '@nestjs/common';

@Controller('api/tasks')
export class AppController {
  @Get()
  getTasks() {
    return [
      {
        id: 0,
        text: 'Task 1 from Nest.js',
        isDone: false,
        date: new Date().toLocaleString(),
      },
      {
        id: 1,
        text: 'Task 2 from Nest.js',
        isDone: true,
        date: new Date().toLocaleString(),
      },
      {
        id: 2,
        text: 'Task 3 from Nest.js',
        isDone: true,
        date: new Date().toLocaleString(),
      },
    ];
  }
}

// import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get()
//   getHello(): string {
//     return this.appService.getHello();
//   }
// }
