/// <reference types="vite/client" />
import type { Theme } from 'vitepress';
import { configureIcons } from '@vunset/vue';
import Layout from './Layout.vue';
import './style.css';
import '@vunset/ui/all.css';
import Preview from './components/Preview.vue';
import ScrollTable from './components/ScrollTable.vue';
import DemoOutput from './components/DemoOutput.vue';
import ApiAccordion from './components/ApiAccordion.vue';
import ApiRow from './components/ApiRow.vue';
import Examples from './components/Examples.vue';
import Frame from './components/Frame.vue';
import InstallTabs from './components/InstallTabs.vue';
import HomeExample from './components/HomeExample.vue';

configureIcons({
  sprite: `${import.meta.env.BASE_URL}sprite.svg`,
  inline: import.meta.glob<string>('../demos/icon/icons/*.svg', { query: '?raw', import: 'default' })
});

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('Preview', Preview);
    app.component('ScrollTable', ScrollTable);
    app.component('DemoOutput', DemoOutput);
    app.component('ApiAccordion', ApiAccordion);
    app.component('ApiRow', ApiRow);
    app.component('Examples', Examples);
    app.component('Frame', Frame);
    app.component('InstallTabs', InstallTabs);
    app.component('HomeExample', HomeExample);
  }
} satisfies Theme;
