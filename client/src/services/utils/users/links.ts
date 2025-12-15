import type { GSK_USER_PUBLIC_SUMMARY } from 'src/services/library/types/structures/users';

export const getUserLinkId = (user: GSK_USER_PUBLIC_SUMMARY | null | undefined): string => {
  if (!user) {
    return '';
  }
  const defaultId = user.id;
  // if User name is empty or null, return id
  if (!user.userName || user.userName.trim() === '') {
    return defaultId;
  }
  // if User name contains spaces, non-alphanumeric characters, return id
  const userNameRegex = /^[a-zA-Z0-9_]+$/;
  if (!userNameRegex.test(user.userName)) {
    return defaultId;
  }
  // else return userName
  return user.userName;
};
