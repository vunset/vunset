import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h } from 'vue';
import { AppButton, AppGroup, FormInput } from '../src';

let wrapper: VueWrapper<any> | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

function mountGroup(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  wrapper = mount(AppGroup as any, {
    props,
    attrs,
    slots: {
      default: () => [h(FormInput, { 'aria-label': 'Query' }), h(AppButton, () => 'Search')]
    },
    attachTo: document.body
  });
  return wrapper;
}

describe('AppGroup', () => {
  it('is a Group in the app-group class, named by label, the caller’s class beside it', () => {
    mountGroup({ label: 'Search' }, { class: 'w-full' });
    const root = wrapper!;

    expect(root.classes()).toEqual(expect.arrayContaining(['app-group', 'w-full']));
    expect(root.attributes('role')).toBe('group');
    expect(root.attributes('aria-label')).toBe('Search');
    expect(root.attributes('data-orientation')).toBe('horizontal');
    expect(root.attributes('data-variant')).toBe('group');
    expect(root.find('.form-input').exists()).toBe(true);
    expect(root.find('.app-button').text()).toBe('Search');
  });

  it('passes variant and orientation on', () => {
    mountGroup({ variant: 'toolbar', orientation: 'vertical' });
    const root = wrapper!;

    expect(root.attributes('role')).toBe('toolbar');
    expect(root.attributes('data-variant')).toBe('toolbar');
    expect(root.attributes('aria-orientation')).toBe('vertical');
    expect(root.attributes('data-orientation')).toBe('vertical');
  });

  it('renders as another element', () => {
    mountGroup({ as: 'fieldset' });
    expect(wrapper!.element.tagName).toBe('FIELDSET');
  });
});
