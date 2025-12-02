import type { GSK_SC_NOTIFICATION } from 'src/services/library/types/data-transfer/notifications';
import { notify } from 'src/services/notifications';

export const events = (label: string, ...args: unknown[]) => {
  switch (label) {
    case 'GSK_SC_NOTIFICATION': {
      const payloadIn: GSK_SC_NOTIFICATION = args[0] as GSK_SC_NOTIFICATION;
      notify(
        payloadIn.payload.message,
        payloadIn.payload?.caption || '',
        payloadIn.payload.type,
        payloadIn.payload.timeout,
        payloadIn.payload.icon,
        true,
        true,
        payloadIn.payload.position,
      );

      return;
    }
    default:
      return;
  }
};

export default events;
