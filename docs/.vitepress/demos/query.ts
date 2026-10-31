import { defineComponent, h, readonly, ref } from 'vue';

/*
  VitePress has no vue-router, so the demos that keep their state in the URL
  (pagination, the data table’s sort) read and write the query string here.
  `QueryLink` stands in for `RouterLink`: a real `href`, navigated in place.
*/
export type Query = Record<string, string | number | undefined>;

const current = ref<Record<string, string>>({});
let listening = false;

const read = () => (current.value = Object.fromEntries(new URLSearchParams(location.search)));

// Relative to the page, so the server renders the same `href` the browser does.
function href(query: Query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value !== undefined) params.set(key, String(value));
  return `?${params.toString()}`;
}

function push(query: Query) {
  history.pushState(history.state, '', `${location.pathname}${href(query)}${location.hash}`);
  read();
}

export function useQuery() {
  if (typeof window !== 'undefined' && !listening) {
    listening = true;
    read();
    window.addEventListener('popstate', read);
  }
  return { query: readonly(current), push, href };
}

export const QueryLink = defineComponent({
  name: 'QueryLink',
  inheritAttrs: true,
  props: { to: { type: Object as () => Query, required: true } },
  setup(props, { slots }) {
    return () =>
      h(
        'a',
        {
          href: href(props.to),
          onClick(event: MouseEvent) {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
              return;
            event.preventDefault();
            push(props.to);
          }
        },
        slots.default?.()
      );
  }
});
