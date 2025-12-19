import { defineStore, acceptHMRUpdate } from 'pinia';
import type {
  GSK_USER_PUBLIC_DETAILS,
  GSK_USER_PUBLIC_SUMMARY,
  GSK_USER_SELF_DETAILS,
} from 'src/services/library/types/structures/users';

export const useUsersStore = defineStore('users', {
  state: () => ({
    listOfUsers: [] as GSK_USER_PUBLIC_SUMMARY[],
    userFullDetails: null as GSK_USER_SELF_DETAILS | null,
    userPublicDetails: null as GSK_USER_PUBLIC_DETAILS | null,
  }),
  getters: {
    publicUserId: (state) => {
      return state.userPublicDetails ? state.userPublicDetails.id : null;
    },
    fullUserId: (state) => {
      return state.userFullDetails ? state.userFullDetails.id : null;
    },
  },
  actions: {
    setListOfUsers(users: GSK_USER_PUBLIC_SUMMARY[]) {
      this.listOfUsers = users;
    },
    setUserFullDetails(userDetails: GSK_USER_SELF_DETAILS | null) {
      this.userFullDetails = userDetails;
    },
    setUserPublicDetails(userDetails: GSK_USER_PUBLIC_DETAILS | null) {
      this.userPublicDetails = userDetails;
    },
    isFullDetailsOf(userId: string): boolean {
      if (!this.userFullDetails) {
        return false;
      }
      return this.userFullDetails.id === userId;
    },
    isPublicDetailsOf(userId: string): boolean {
      if (!this.userPublicDetails) {
        return false;
      }
      return this.userPublicDetails.id === userId;
    },
    resetUserDetails() {
      this.userFullDetails = null;
    },

    getUserDisplayNameFromUrlId(urlUserId: string | undefined | null): string {
      if (!urlUserId) {
        return '';
      }
      // urlUserId is either id or userName
      const user = this.listOfUsers.find((user) => {
        if (
          user.id.toLowerCase().trim() === urlUserId.toLowerCase().trim() ||
          (user.userName || '').toLowerCase().trim() === urlUserId.toLowerCase().trim()
        ) {
          return true;
        }
        return false;
      });
      return user ? user.displayName || '' : ''; // return empty string if not found
    },

    getUserIdFromUrlId(urlUserId: string): string {
      if (!urlUserId) {
        return '';
      }
      // urlUserId is either id or userName
      const user = this.listOfUsers.find((user) => {
        if (
          (user?.id || '').toLowerCase().trim() === (urlUserId || '').toLowerCase().trim() ||
          (user.userName || '').toLowerCase().trim() === (urlUserId || '').toLowerCase().trim()
        ) {
          return true;
        }
        return false;
      });
      return user ? user.id : ''; // return empty string if not found
    },
  },
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot));
}
