interface QueuedLocationUpdate {
  latitude: number;
  longitude: number;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = 'location_update_queue';
const MAX_QUEUE_SIZE = 50;
const MAX_RETRY_COUNT = 3;

export class LocationUpdateQueue {
  private queue: QueuedLocationUpdate[] = [];

  constructor() {
    this.loadQueue();
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load location queue:', error);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save location queue:', error);
    }
  }

  enqueue(latitude: number, longitude: number): void {
    const update: QueuedLocationUpdate = {
      latitude,
      longitude,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(update);

    // Limit queue size
    if (this.queue.length > MAX_QUEUE_SIZE) {
      this.queue = this.queue.slice(-MAX_QUEUE_SIZE);
    }

    this.saveQueue();
  }

  dequeue(): QueuedLocationUpdate | null {
    if (this.queue.length === 0) return null;
    const update = this.queue.shift()!;
    this.saveQueue();
    return update;
  }

  peek(): QueuedLocationUpdate | null {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  incrementRetry(update: QueuedLocationUpdate): void {
    update.retryCount++;
    if (update.retryCount >= MAX_RETRY_COUNT) {
      // Remove from queue if max retries exceeded
      this.dequeue();
    } else {
      // Put back at the front
      this.queue.unshift(update);
      this.saveQueue();
    }
  }

  clear(): void {
    this.queue = [];
    this.saveQueue();
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}

export const locationQueue = new LocationUpdateQueue();
