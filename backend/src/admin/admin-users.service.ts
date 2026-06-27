import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LabEntryEntity,
  PosterJobEntity,
  RecipeEntity,
  UserEntity,
} from '../database/entities';
import {
  AdminUserDetailDto,
  AdminUserDto,
  UserPageDto,
} from './dto/admin.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(LabEntryEntity)
    private readonly lab: Repository<LabEntryEntity>,
    @InjectRepository(RecipeEntity)
    private readonly recipes: Repository<RecipeEntity>,
    @InjectRepository(PosterJobEntity)
    private readonly jobs: Repository<PosterJobEntity>,
  ) {}

  async listUsers(
    q?: string,
    page = 1,
    size = 20,
  ): Promise<UserPageDto> {
    const take = Math.min(Math.max(size, 1), 100);
    const skip = Math.max(0, (page - 1) * take);
    const qb = this.users
      .createQueryBuilder('u')
      .orderBy('u.createdAt', 'DESC')
      .skip(skip)
      .take(take);
    if (q) {
      qb.andWhere('(u.deviceId LIKE :q OR u.account LIKE :q)', {
        q: `%${q}%`,
      });
    }
    const [rows, total] = await qb.getManyAndCount();
    return {
      items: rows.map((r) => this.toView(r)),
      total,
      page,
      size: take,
    };
  }

  async getUser(id: string): Promise<AdminUserDetailDto> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const [labEntries, recipes, posters] = await Promise.all([
      this.lab.count({ where: { ownerId: id } }),
      this.recipes.count({ where: { ownerId: id } }),
      this.jobs.count({ where: { ownerId: id } }),
    ]);
    return {
      user: this.toView(user),
      counts: { labEntries, recipes, posters },
    };
  }

  private toView(u: UserEntity): AdminUserDto {
    return {
      id: u.id,
      account: u.account,
      deviceId: u.deviceId,
      isDevice: u.isDevice,
      displayName: u.displayName,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    };
  }
}
