import { Injectable, Logger } from '@nestjs/common';
import { ServiceResult } from '../../common/interfaces/api-response.interface';

interface PlatformStatus {
  maintenanceMode: boolean;
  message: string | null;
}

interface AppVersion {
  version: string;
  forceUpdate: boolean;
  storeUrl: string;
}

@Injectable()
export class PlatformService {
  private readonly logger = new Logger(PlatformService.name);
  private maintenanceMode = false;
  private maintenanceMessage: string | null = null;

  getStatus(): ServiceResult<PlatformStatus> {
    return {
      success: true,
      message: 'Status fetched',
      data: {
        maintenanceMode: this.maintenanceMode,
        message: this.maintenanceMessage,
      },
    };
  }

  setMaintenanceMode(
    enabled: boolean,
    message: string | null,
  ): ServiceResult<null> {
    this.maintenanceMode = enabled;
    this.maintenanceMessage = message;
    this.logger.log(
      JSON.stringify({
        action: 'MAINTENANCE_MODE_CHANGED',
        enabled,
        message,
      }),
    );
    return { success: true, message: 'Maintenance mode updated', data: null };
  }

  getAppVersion(platform: string): ServiceResult<AppVersion> {
    // TODO: Store in database and allow admin to configure
    const versions: Record<string, AppVersion> = {
      android: {
        version: '1.0.0',
        forceUpdate: false,
        storeUrl: 'https://play.google.com/store',
      },
      ios: {
        version: '1.0.0',
        forceUpdate: false,
        storeUrl: 'https://apps.apple.com',
      },
    };

    const version = versions[platform] ?? versions['android'];
    return { success: true, message: 'Version fetched', data: version };
  }
}
