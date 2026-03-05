import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MobileLayout from './mobile-layout';
import { createElement } from 'react';

const meta = {
  title: 'Layout/MobileLayout',
  component: MobileLayout,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MobileLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: createElement('div', { className: 'p-5' },
      createElement('h1', { className: 'text-2xl font-bold text-stone-800' }, 'Content Area'),
      createElement('p', { className: 'text-stone-400 mt-2' }, 'This is the mobile layout shell with header and floating tab bar.'),
    ),
  },
};
