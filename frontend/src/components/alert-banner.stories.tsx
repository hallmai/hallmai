import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import AlertBanner from './alert-banner';

const meta = {
  title: 'Components/AlertBanner',
  component: AlertBanner,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof AlertBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
