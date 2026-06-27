import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMAGE_PROVIDER } from './image-provider.interface';
import { StubTextProvider } from './stub-text.provider';
import { StubImageProvider } from './stub-image.provider';
import { GptImage2Provider } from './gpt-image2.provider';
import { IllustrationService } from './illustration.service';
import { StorageModule } from '../storage/storage.module';

const logger = new Logger('AiModule');

@Global()
@Module({
  imports: [StorageModule],
  providers: [
    StubTextProvider,
    StubImageProvider,
    GptImage2Provider,
    IllustrationService,
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
  exports: [StubTextProvider, IMAGE_PROVIDER, IllustrationService],
})
export class AiModule {}
