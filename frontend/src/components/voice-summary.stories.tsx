import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import VoiceSummary from './voice-summary';

const meta = {
  title: 'Components/VoiceSummary',
  component: VoiceSummary,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'hallmai' },
  },
} satisfies Meta<typeof VoiceSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
