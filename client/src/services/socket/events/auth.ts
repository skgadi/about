import type {
  GSK_SC_AUTH_SIGN_IN_SUCCESS,
  GSK_SC_AUTH_SIGN_OUT_SUCCESS,
} from 'src/services/library/types/data-transfer/auth';
import { useAuthStore } from 'src/stores/auth-store';

export const events = (label: string, ...args: unknown[]) => {
  switch (label) {
    case 'GSK_SC_AUTH_SIGN_IN_SUCCESS': {
      const payloadIn: GSK_SC_AUTH_SIGN_IN_SUCCESS = args[0] as GSK_SC_AUTH_SIGN_IN_SUCCESS;
      const authStore = useAuthStore();
      authStore.setUserDetails(payloadIn.payload.user);
      return;
    }

    case 'GSK_SC_AUTH_SIGN_OUT_SUCCESS': {
      const payloadIn: GSK_SC_AUTH_SIGN_OUT_SUCCESS = args[0] as GSK_SC_AUTH_SIGN_OUT_SUCCESS;
      if (payloadIn.id !== 'GSK_SC_AUTH_SIGN_OUT_SUCCESS') {
        console.log('Sign-out success payload received:', payloadIn);
      }
      const authStore = useAuthStore();
      authStore.signOut();
      return;
    }

    default:
      return;
  }
};

export default events;
