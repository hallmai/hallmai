import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import WeeklyInsight from './weekly-insight';

const meta = {
  title: 'Components/WeeklyInsight',
  component: WeeklyInsight,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof WeeklyInsight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
