import { computed } from 'vue';
import { useData } from 'vitepress';

export interface SidebarLink {
  text: string;
  link: string;
}

export interface SidebarGroup {
  text: string;
  items: SidebarLink[];
}

/** The page's path without the site's base, as the config's links write it: `/ui/app-button`. */
export function usePagePath() {
  const { page } = useData();
  return computed(() => '/' + page.value.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, ''));
}

/** The current page's sidebar: the first whose prefix the path starts with, `/nuxt/`, `/ui/` or `/`. */
export function useSidebar() {
  const { theme } = useData();
  const path = usePagePath();

  const groups = computed<SidebarGroup[]>(() => {
    const list = Object.entries<SidebarGroup[]>(theme.value.sidebar);
    return list.find(([prefix]) => path.value.startsWith(prefix))![1];
  });

  // Previous and next in the sidebar's order, across its groups.
  const neighbors = computed(() => {
    const links = groups.value.flatMap((group) => group.items);
    const index = links.findIndex((item) => item.link === path.value);
    if (index === -1) return { prev: undefined, next: undefined };
    return { prev: links[index - 1], next: links[index + 1] };
  });

  return { groups, neighbors, path };
}

/** The Form/App prefix of a ui name, apart, so it can be dimmed. */
export const formatText = (text: string) => text.replace(/^(Form|App)(?=[A-Z])/, '<span>$1</span>');

// Which top-level part of the docs a link or path belongs to, for the section switcher.
export const section = (link: string) => {
  if (link === '/' || link === '/index.md') return 'home';
  if (link.startsWith('/changelog')) return 'changelog';
  return link.startsWith('/ui/') ? 'ui' : link.startsWith('/nuxt/') ? 'nuxt' : 'vue';
};
