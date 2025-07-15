import { addons } from 'storybook/internal/manager-api';
import { themes } from 'storybook/internal/theming';

export default {};
addons.setConfig({
  theme: themes.light,
  panelPosition: 'bottom',
  selectedPanel: 'storybook/controls/panel',
  showNav: true,
  showPanel: true,
  showToolbar: true,
  sidebar: {
    showRoots: true,
    collapsedRoots: ['other'],
    renderLabel: (item: any) => {
      // Custom sidebar label rendering
      return item.name;
    },
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
    'storybook/background': { hidden: false },
    'storybook/viewport': { hidden: false },
    'storybook/toolbars': { hidden: false },
  },
  // Custom branding
  brandTitle: 'Design System',
  brandUrl: './',
  brandImage: undefined,
  brandTarget: '_self',
});
