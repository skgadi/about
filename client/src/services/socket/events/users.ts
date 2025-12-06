import type {
  GSK_SC_USER_LIST_UPDATE,
  GSK_SC_USER_PUBLIC_DETAILS_UPDATE,
  GSK_SC_USER_SELF_DETAILS_UPDATE,
} from 'src/services/library/types/data-transfer/users';
import { useUsersStore } from 'src/stores/users-store';

export const events = (label: string, ...args: unknown[]) => {
  const usersStore = useUsersStore();
  switch (label) {
    case 'GSK_SC_USER_LIST_UPDATE': {
      const payloadIn: GSK_SC_USER_LIST_UPDATE = args[0] as GSK_SC_USER_LIST_UPDATE;
      usersStore.setListOfUsers(payloadIn.payload.usersList);
      return;
    }

    case 'GSK_SC_USER_PUBLIC_DETAILS_UPDATE': {
      const payloadIn: GSK_SC_USER_PUBLIC_DETAILS_UPDATE =
        args[0] as GSK_SC_USER_PUBLIC_DETAILS_UPDATE;
      usersStore.setUserPublicDetails(payloadIn.payload.userPublicDetails);
      return;
    }

    case 'GSK_SC_USER_SELF_DETAILS_UPDATE': {
      const payloadIn: GSK_SC_USER_SELF_DETAILS_UPDATE = args[0] as GSK_SC_USER_SELF_DETAILS_UPDATE;
      usersStore.setUserFullDetails(payloadIn.payload.userSelfDetails);
      return;
    }

    default:
      return;
  }
};

export default events;
