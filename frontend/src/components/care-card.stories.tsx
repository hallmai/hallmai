import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CareCard from './care-card';

const meta = {
  title: 'Components/CareCard',
  component: CareCard,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    mood: {
      control: 'select',
      options: ['good', 'okay', 'low'],
    },
  },
} satisfies Meta<typeof CareCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Good: Story = {
  args: {
    dateKey: 'cardToday',
    mood: 'good',
    summaryKey: 'cardSummary1',
  },
};

export const Okay: Story = {
  args: {
    dateKey: 'cardYesterday',
    mood: 'okay',
    summaryKey: 'cardSummary2',
    alertKeys: ['alertLoneliness'],
  },
};

export const Low: Story = {
  args: {
    dateKey: 'cardMar2',
    mood: 'low',
    summaryKey: 'cardSummary4',
    alertKeys: ['alertSleepTag', 'alertLowMood'],
  },
};

export const Last: Story = {
  args: {
    dateKey: 'cardMar3',
    mood: 'good',
    summaryKey: 'cardSummary3',
    isLast: true,
  },
};
