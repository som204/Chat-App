import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;

export const getWebContainer = async () => {
  if (!webContainerInstance) {
    try {
      webContainerInstance = await WebContainer.boot();
    } catch (error) {
      console.error("Failed to boot WebContainer:", error);
      throw new Error("WebContainer initialization failed.");
    }
  }
  return webContainerInstance;
};
