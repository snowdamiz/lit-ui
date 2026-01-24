// Import registry data - tsup bundles JSON files inline
import registryData from '../registry/registry.json';

/**
 * Registry file entry
 */
export interface RegistryFile {
  path: string;
  type: 'component' | 'base' | 'style';
}

/**
 * Component entry in the registry
 */
export interface RegistryComponent {
  name: string;
  description: string;
  files: RegistryFile[];
  dependencies: string[]; // npm packages
  registryDependencies: string[]; // other components
}

/**
 * Full registry structure
 */
export interface Registry {
  name: string;
  base: { files: RegistryFile[]; dependencies: string[] };
  components: RegistryComponent[];
}

/**
 * Get the full registry
 */
export function getRegistry(): Registry {
  return registryData as Registry;
}

/**
 * Get a component by name
 */
export function getComponent(name: string): RegistryComponent | undefined {
  const registry = getRegistry();
  return registry.components.find((c) => c.name === name);
}

/**
 * List all available components
 */
export function listComponents(): RegistryComponent[] {
  return getRegistry().components;
}

/**
 * Recursively resolve all component dependencies
 * Returns array of all component names needed (including the requested one)
 */
export function resolveDependencies(componentName: string): string[] {
  const registry = getRegistry();
  const resolved = new Set<string>();
  const queue = [componentName];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (resolved.has(current)) {
      continue;
    }

    const component = registry.components.find((c) => c.name === current);
    if (!component) {
      // Component not found, skip
      continue;
    }

    resolved.add(current);

    // Add registry dependencies to queue
    for (const dep of component.registryDependencies) {
      if (!resolved.has(dep)) {
        queue.push(dep);
      }
    }
  }

  return Array.from(resolved);
}

/**
 * Get base files needed for initialization
 */
export function getBaseFiles(): RegistryFile[] {
  return getRegistry().base.files;
}

/**
 * Get base npm dependencies needed for initialization
 */
export function getBaseDependencies(): string[] {
  return getRegistry().base.dependencies;
}
