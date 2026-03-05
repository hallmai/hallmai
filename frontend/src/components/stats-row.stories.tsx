import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import StatsRow from './stats-row';

const meta = {
  title: 'Components/StatsRow',
  component: StatsRow,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof StatsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
