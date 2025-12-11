import type { GSK_USER_CONTRIBUTION } from '../structures/users.js';

export interface GSK_CS_META_INFO_UPDATE_A_FIELD {
  id: 'GSK_CS_META_INFO_UPDATE_A_FIELD';
  payload: {
    elementType: 'timelines' | 'events' | 'documents' | 'activities';
    elementId: string;
    userId: string;
    fieldName: string;
    newValue: string | boolean | string[] | GSK_USER_CONTRIBUTION[];
  };
}
