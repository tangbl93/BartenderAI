import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { I18nModule } from './i18n/i18n.module';
import { AiModule } from './ai/ai.module';
import { MetaModule } from './meta/meta.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { RecipesModule } from './recipes/recipes.module';
import { TemplatesModule } from './templates/templates.module';
import { PostersModule } from './posters/posters.module';
import { LabModule } from './lab/lab.module';
import { ModerationModule } from './moderation/moderation.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    I18nModule,
    AiModule,
    AuthModule,
    MetaModule,
    IngredientsModule,
    RecipesModule,
    TemplatesModule,
    PostersModule,
    LabModule,
    ModerationModule,
    StatsModule,
  ],
  providers: [
    // Global JWT auth guard; @Public() opts routes out.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
