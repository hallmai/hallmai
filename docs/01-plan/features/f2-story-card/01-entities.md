# Feature 2 - 엔티티: Conversation + StoryCard

## Step 1: Conversation 엔티티

생성 파일: `backend/src/common/entity/conversation.entity.ts`

```typescript
@Entity('conversations')
export class Conversation extends BaseEntity {
  @Index()
  @Column({ name: 'device_id', type: 'int' })
  deviceId: number;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ name: 'started_at', type: 'datetime' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt: Date | null;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null;

  @Column({ type: 'longtext', nullable: true })
  transcript: string | null;
}
```

수정 파일: `backend/src/common/entity/entity.providers.ts` — Conversation 추가

---

## Step 2: StoryCard 엔티티

생성 파일: `backend/src/common/entity/story-card.entity.ts`

```typescript
export type Vibe = 'warm' | 'calm' | 'quiet';

export interface DailyStoryData {
  topic: string;
  quote: string;
  vibe: Vibe;
}

@Entity('story_cards')
export class StoryCard extends BaseEntity {
  @Index()
  @Column({ name: 'device_id', type: 'int' })
  deviceId: number;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'varchar', length: 30, default: 'daily_story' })
  type: string;

  @Column({ name: 'carded_at', type: 'datetime' })
  cardedAt: Date;

  @Column({ type: 'json' })
  data: DailyStoryData;
}
```

수정 파일: `backend/src/common/entity/entity.providers.ts` — StoryCard 추가
