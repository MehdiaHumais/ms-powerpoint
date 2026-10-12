export const isValidSheetName = (name: string): boolean => {
  // Excel sheet name rules: max 31 chars, cannot contain : \ / ? * [ ]
  const invalidChars = /[:\\\/\?\*\[\]]/;
  return name.length > 0 && name.length <= 31 && !invalidChars.test(name);
};