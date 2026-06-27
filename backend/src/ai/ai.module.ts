import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TEXT_PROVIDER } from './text-provider.interface';
import { IMAGE_PROVIDER } from './image-provider.interface';
import { StubTextProvider } from './stub-text.provider';
import { StubImageProvider } from './stub-image.provider';
import { GptImage2Provider } from './gpt-image2.provider';
import { I18nService } from '../i18n/i18n.service';

const logger = new Logger('AiModule');

@Global()
@Module({
  providers: [
    StubTextProvider,
    StubImageProvider,
    GptImage2Provider,
    {
      // Text provider selection. Only the stub ships in v1; "openai-compatible"
      // can be wired later. Default to stub when no key configured.
      provide: TEXT_PROVIDER,
      useFactory: (config: ConfigService, i18n: I18nService) => {
        const provider = config.get<string>('text.provider');
        const key = config.get<string>('text.apiKey');
        if (provider === 'openai-compatible' && key) {
          logger.warn(
            'TEXT_PROVIDER=openai-compatible requested but not implemented; using stub.',
          );
        }
        return new StubTextProvider(i18n);
      },
      inject: [ConfigService, I18nService],
    },
    {
      // Image provider selection: gpt-image-2 only when a key is present,
      // otherwise fall back to the deterministic stub.
      provide: IMAGE_PROVIDER,
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('image.provider');
        const key = config.get<string>('image.apiKey');
        if (provider === 'gpt-image-2' && key) {
          logger.log('Using GptImage2Provider for poster generation.');
          return new GptImage2Provider(config);
        }
        logger.log('Using StubImageProvider for poster generation (no key set).');
        return new StubImageProvider();
      },
      inject: [ConfigService],
    },
  ],
  exports: [TEXT_PROVIDER, IMAGE_PROVIDER],
})
export class AiModule {}
