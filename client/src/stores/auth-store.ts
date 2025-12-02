import { defineStore, acceptHMRUpdate } from 'pinia';
import type { GSK_USER_SELF_DETAILS } from 'src/services/library/types/structures/users';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userDetails: null as GSK_USER_SELF_DETAILS | null,
  }),

  getters: {
    isSignedIn: (state) => {
      return state.userDetails !== null;
    },
    getUserId: (state) => {
      return state.userDetails ? state.userDetails.id : null;
    },
  },

  actions: {
    setUserDetails(userDetails: GSK_USER_SELF_DETAILS) {
      this.userDetails = userDetails;
    },
    signOut() {
      this.userDetails = null;
    },
    isSignedInAs(userId: string): boolean {
      return this.userDetails?.id === userId;
    },
  },
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
