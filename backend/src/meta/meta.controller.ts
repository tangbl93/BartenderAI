import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { SUPPORTED_LOCALES } from '../common/constants';

@ApiTags('meta')
@Controller()
export class MetaController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        uptime: { type: 'number' },
      },
    },
  })
  health() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Public()
  @Get('meta/locales')
  @ApiOperation({ summary: '支持的语言列表' })
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'string' } } })
  locales(): string[] {
    return [...SUPPORTED_LOCALES];
  }
}
