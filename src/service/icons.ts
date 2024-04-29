const resources = import.meta.globEager('../assets/dynamic/*.svg');

export const iconsMap: Record<string, unknown> = {};

/**
 * Loads dynamic icons located under "assets/dynamic" under memory iconsMap to be available for application usage.
 */
export const loadIcons = async () => {
  for (const path in resources) {
    const iconName = path.split('/').slice(-1)[0];
    iconsMap[iconName] = (await import(/* @vite-ignore */ path)).default;
  }
};

/**
 * Retrieves icons SVG component by name.
 * @param name
 * @param extension
 */
export const getIcon = (name: string, extension = 'svg'): string => {
  const icon = iconsMap[`${name}.${extension}`];

  if (!icon) {
    console.error(`Icon -> ${name}, was not found under dynamic assets folder`);
  }

  return icon as string;
};
