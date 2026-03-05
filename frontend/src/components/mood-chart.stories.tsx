import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MoodChart from './mood-chart';

const meta = {
  title: 'Components/MoodChart',
  component: MoodChart,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof MoodChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
