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

export const Warm: Story = {
  args: {
    date: '3월 5일',
    mood: 'good',
    moodLabel: '좋음',
    summary: '어머니가 이웃 할머니와 산책을 다녀오셨어요. 따뜻한 날씨 덕분에 기분이 좋으셨대요.',
    quote: '요즘 옆집 할머니랑 산책하는 게 제일 좋더라.',
  },
};

export const Calm: Story = {
  args: {
    date: '3월 4일',
    mood: 'okay',
    moodLabel: '보통',
    summary: 'TV에서 옛노래가 나와서 아버지 생각이 나셨대요. 저녁엔 된장찌개를 끓여 드셨어요.',
    quote: '그 노래 들으니까 옛날 생각이 나더라고.',
  },
};

export const Quiet: Story = {
  args: {
    date: '3월 2일',
    mood: 'low',
    moodLabel: '우울',
    summary: '어젯밤에 잠을 설쳤다고 하셨어요. 그 외엔 조용한 하루였대요.',
  },
};

export const Last: Story = {
  args: {
    date: '3월 3일',
    mood: 'good',
    moodLabel: '좋음',
    summary: '손주 사진을 보내달라고 하셨어요. 매일 산책도 꾸준히 하고 계세요.',
    quote: '손주들 사진 좀 보내줘라.',
  },
};
