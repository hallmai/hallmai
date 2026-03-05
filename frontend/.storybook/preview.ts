import type { Preview } from '@storybook/nextjs-vite'
import { I18nProvider } from '../src/lib/i18n'
import { createElement } from 'react'
import '../src/app/globals.css'

const preview: Preview = {
  decorators: [
    (Story) => createElement(I18nProvider, null, createElement(Story)),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'hallmai',
      values: [
        { name: 'hallmai', value: '#FFF8F0' },
        { name: 'dark', value: '#1c1917' },
        { name: 'white', value: '#ffffff' },
      ],
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo'
    }
  },
};

export default preview;
