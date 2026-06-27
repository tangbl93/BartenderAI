import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostersService } from './posters.service';
import { PosterJobDto } from './dto/poster.dto';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('posters')
@ApiBearerAuth()
@Controller('posters')
export class PostersController {
  constructor(private readonly service: PostersService) {}

  @Post('jobs')
  @HttpCode(202)
  @ApiOperation({ summary: '为配方创建海报生成任务（多维度并行）' })
  createJob(@Body() dto: PosterJobDto, @CurrentUser() user: AuthUser) {
    return this.service.createJob(dto, user?.id);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: '查询海报任务进度' })
  findJob(@Param('id') id: string) {
    return this.service.findJob(id);
  }

  @Post(':id/retry')
  @HttpCode(202)
  @ApiOperation({ summary: '单张海报失败重试' })
  retry(@Param('id') id: string) {
    return this.service.retryPoster(id);
  }
}
