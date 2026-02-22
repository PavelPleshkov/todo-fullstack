import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  findAll() {
    return this.tasksRepository.find({ where: { inBin: false } });
  }

  create(createTaskDto: { title: string }) {
    const task = this.tasksRepository.create(createTaskDto);
    return this.tasksRepository.save(task);
  }

  async update(id: number, updateTaskDto: Partial<Task>) {
    await this.tasksRepository.update(id, updateTaskDto);
    return this.tasksRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.tasksRepository.update(id, { inBin: true });
  }

  async bulkRemove() {
    return this.tasksRepository.delete({ inBin: true });
  }

  findOne(id: number) {
    return this.tasksRepository.findOne({ where: { id } });
  }
}
