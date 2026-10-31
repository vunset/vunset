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
import ExampleTabs from './components/ExampleTabs.vue';
import SectionFrame from './components/SectionFrame.vue';
import SectionCard from './components/SectionCard.vue';
import InstallTabs from './components/InstallTabs.vue';
import HomeExample from './components/HomeExample.vue';

configureIcons({
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
    app.component('ExampleTabs', ExampleTabs);
    app.component('SectionFrame', SectionFrame);
    app.component('SectionCard', SectionCard);
    app.component('InstallTabs', InstallTabs);
    app.component('HomeExample', HomeExample);
  }
} satisfies Theme;
