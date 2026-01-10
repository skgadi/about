export const getUserNames = (displayName: string, names: string[]): string => {
  const allNames = {
    displayName,
    names,
  };
  return JSON.stringify(allNames, null, 2);
};
